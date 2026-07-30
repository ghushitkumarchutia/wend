import { db } from '../../common/db.js';
import {
  templates,
  templateDays,
  templateEvents,
  trips,
  tripMembers,
  itineraryEvents,
  itineraryFlightDetails,
} from '../../db/index.js';
import { eq, sql, asc, or, ilike, and, isNull } from 'drizzle-orm';
import { logActivityInTx } from '../../common/activity.js';
import { remindersQueue } from '../../common/queues.js';
import type { TemplateWithDays, PaginatedResponse } from '../../shared/types.js';

export async function listPublishedTemplates(
  page: number,
  pageSize: number,
  search?: string,
  category?: string,
): Promise<PaginatedResponse<Omit<TemplateWithDays, 'days'>>> {
  const conditions = [
    or(eq(templates.visibility, 'published'), eq(templates.visibility, 'featured')),
  ];

  if (search) {
    conditions.push(
      or(ilike(templates.title, `%${search}%`), ilike(templates.destination, `%${search}%`)),
    );
  }

  if (category) {
    conditions.push(sql`${templates.categories}::jsonb @> ${JSON.stringify([category])}::jsonb`);
  }

  const whereClause = and(...conditions);

  const [countResult] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(templates)
    .where(whereClause);

  const total = countResult?.total ?? 0;
  const offset = (page - 1) * pageSize;

  const rows = await db.query.templates.findMany({
    where: whereClause,
    orderBy: [asc(templates.createdAt)],
    limit: pageSize,
    offset,
  });

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title,
    destination: r.destination,
    description: r.description,
    coverImageUrl: r.coverImageUrl,
    categories: r.categories as string[],
    recommendedGroupSizeMin: r.recommendedGroupSizeMin,
    recommendedGroupSizeMax: r.recommendedGroupSizeMax,
    bestSeason: r.bestSeason as string[] | null,
    difficultyLevel: r.difficultyLevel,
    estimatedBudgetBreakdown: r.estimatedBudgetBreakdown as Record<string, number> | null,
    estimatedBudgetCurrency: r.estimatedBudgetCurrency,
    visibility: r.visibility as TemplateWithDays['visibility'],
    cloneCount: r.cloneCount,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTemplateById(templateId: string): Promise<TemplateWithDays> {
  const row = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
    with: {
      days: {
        orderBy: [asc(templateDays.order)],
        with: {
          events: {
            orderBy: [asc(templateEvents.order)],
          },
        },
      },
    },
  });

  if (!row) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (row.visibility !== 'published' && row.visibility !== 'featured') {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    categories: row.categories as string[],
    recommendedGroupSizeMin: row.recommendedGroupSizeMin,
    recommendedGroupSizeMax: row.recommendedGroupSizeMax,
    bestSeason: row.bestSeason as string[] | null,
    difficultyLevel: row.difficultyLevel,
    estimatedBudgetBreakdown: row.estimatedBudgetBreakdown as Record<string, number> | null,
    estimatedBudgetCurrency: row.estimatedBudgetCurrency,
    visibility: row.visibility as TemplateWithDays['visibility'],
    cloneCount: row.cloneCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    days: row.days.map((d) => ({
      id: d.id,
      dayNumber: d.dayNumber,
      order: d.order,
      events: d.events.map((e) => ({
        id: e.id,
        title: e.title,
        time: e.time,
        location: e.location,
        description: e.description,
        order: e.order,
      })),
    })),
  };
}

export async function cloneTemplateToTrip(
  templateId: string,
  userId: string,
  data: {
    existingTripId?: string;
    tripName?: string;
    startDate?: string;
    endDate?: string;
    destination?: string;
    baseCurrency?: string;
  },
) {
  const template = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
    with: {
      days: {
        orderBy: [asc(templateDays.order)],
        with: {
          events: {
            orderBy: [asc(templateEvents.order)],
            with: { flightDetails: true },
          },
        },
      },
    },
  });

  if (!template) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (!data.existingTripId && data.startDate && data.endDate) {
    const newStart = new Date(data.startDate);
    const newEnd = new Date(data.endDate);

    const existingTrips = await db
      .select({
        id: trips.id,
        name: trips.name,
        startDate: trips.startDate,
        endDate: trips.endDate,
      })
      .from(trips)
      .innerJoin(tripMembers, eq(trips.id, tripMembers.tripId))
      .where(and(eq(tripMembers.userId, userId), isNull(trips.archivedAt)));

    const now = new Date();

    for (const t of existingTrips) {
      const isOngoing = now >= t.startDate && now <= t.endDate;
      const isUpcoming = now < t.startDate;

      if (isOngoing) {
        if (newStart <= t.endDate) {
          const err = new Error(
            `You have an ongoing trip (${t.name}) until ${t.endDate.toLocaleDateString()}. You can only add new trips after this date.`,
          ) as Error & { status: number };
          err.status = 409;
          throw err;
        }
      } else if (isUpcoming) {
        const isEntirelyBefore = newEnd < t.startDate;
        const isEntirelyAfter = newStart > t.endDate;
        if (!isEntirelyBefore && !isEntirelyAfter) {
          const err = new Error(
            `Your new trip overlaps with an upcoming trip (${t.name}) from ${t.startDate.toLocaleDateString()} to ${t.endDate.toLocaleDateString()}. You must choose dates entirely before or entirely after this trip.`,
          ) as Error & { status: number };
          err.status = 409;
          throw err;
        }
      } else {
        const isEntirelyBefore = newEnd < t.startDate;
        const isEntirelyAfter = newStart > t.endDate;
        if (!isEntirelyBefore && !isEntirelyAfter) {
          const err = new Error(
            `Your new trip overlaps with an existing past trip (${t.name}).`,
          ) as Error & { status: number };
          err.status = 409;
          throw err;
        }
      }
    }
  }

  const { tripId, emitActivities, tripDepartureDate, newEvents } = await db.transaction(
    async (tx) => {
      let currentTripId = data.existingTripId;
      let activities: (() => Promise<void>)[] = [];
      let currentTripStart = data.startDate ? new Date(data.startDate) : new Date();

      if (!currentTripId) {
        const [newTrip] = await tx
          .insert(trips)
          .values({
            name: data.tripName!,
            destination: data.destination ?? template.destination,
            startDate: new Date(data.startDate!),
            endDate: new Date(data.endDate!),
            baseCurrency: data.baseCurrency ?? 'USD',
            createdByUserId: userId,
          })
          .returning();

        await tx.insert(tripMembers).values({
          tripId: newTrip.id,
          userId,
          role: 'organizer',
        });

        currentTripId = newTrip.id;
        currentTripStart = newTrip.startDate;

        const emitActivity = await logActivityInTx(tx, {
          tripId: currentTripId,
          actorUserId: userId,
          type: 'trip_created',
        });
        activities.push(emitActivity);
      }

      const createdEvents = [];

      for (const day of template.days) {
        const eventDate = new Date(currentTripStart);
        eventDate.setDate(eventDate.getDate() + day.dayNumber - 1);

        for (const event of day.events) {
          const [newEvent] = await tx
            .insert(itineraryEvents)
            .values({
              tripId: currentTripId!,
              title: event.title,
              category: (event.category ??
                'activity') as typeof itineraryEvents.$inferInsert.category,
              status: (event.status ?? 'confirmed') as typeof itineraryEvents.$inferInsert.status,
              startAt: eventDate,
              location: event.location ?? null,
              notes: event.description ?? null,
              order: event.order,
              createdByUserId: userId,
            })
            .returning();

          createdEvents.push(newEvent);

          if (event.flightDetails) {
            await tx.insert(itineraryFlightDetails).values({
              eventId: newEvent.id,
              airline: event.flightDetails.airline ?? null,
              flightNumber: event.flightDetails.flightNumber ?? null,
              departureAirport: event.flightDetails.departureAirport ?? null,
              arrivalAirport: event.flightDetails.arrivalAirport ?? null,
              confirmationRef: event.flightDetails.confirmationRef ?? null,
              terminal: event.flightDetails.terminal ?? null,
              gate: event.flightDetails.gate ?? null,
              seat: event.flightDetails.seat ?? null,
              baggageAllowance: event.flightDetails.baggageAllowance ?? null,
            });
          }

          const emitActivity = await logActivityInTx(tx, {
            tripId: currentTripId!,
            actorUserId: userId,
            type: 'itinerary_added',
            metadata: { eventTitle: newEvent.title },
          });
          activities.push(emitActivity);
        }
      }

      await tx
        .update(templates)
        .set({ cloneCount: sql`${templates.cloneCount} + 1` })
        .where(eq(templates.id, templateId));

      return {
        tripId: currentTripId,
        emitActivities: activities,
        tripDepartureDate: currentTripStart,
        newEvents: createdEvents,
      };
    },
  );

  for (const emit of emitActivities) {
    emit().catch(() => {});
  }

  if (!data.existingTripId && tripDepartureDate) {
    const reminderTime = new Date(tripDepartureDate.getTime() - 24 * 60 * 60 * 1000);
    const delay = Math.max(0, reminderTime.getTime() - Date.now());

    if (delay > 0) {
      await remindersQueue.add(
        `reminder-trip-${tripId}-1d`,
        { type: 'trip-departure', tripId },
        { delay, jobId: `reminder-trip-${tripId}-1d` },
      );
    }
  }

  for (const ev of newEvents) {
    const eventTime = new Date(ev.startAt).getTime();
    const delay = Math.max(0, eventTime - 60 * 60 * 1000 - Date.now());
    if (delay > 0) {
      await remindersQueue.add(
        `reminder-event-${ev.id}-1h`,
        { type: 'event-start', tripId, eventId: ev.id },
        { delay, jobId: `reminder-event-${ev.id}-1h` },
      );
    }
  }

  return { tripId };
}
