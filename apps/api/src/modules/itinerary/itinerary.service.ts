import { eq, and, sql, asc } from 'drizzle-orm';
import { db } from '../../common/db';
import { itineraryEvents, itineraryFlightDetails, activityLog } from '@wend/db';

export const ItineraryService = {
  async list(tripId: string) {
    const events = await db
      .select()
      .from(itineraryEvents)
      .where(eq(itineraryEvents.tripId, tripId))
      .orderBy(asc(itineraryEvents.startAt), asc(itineraryEvents.order));

    const eventIds = events.map((e) => e.id);
    if (eventIds.length === 0) return [];

    const flights = await db
      .select()
      .from(itineraryFlightDetails)
      .where(sql`${itineraryFlightDetails.eventId} IN ${eventIds}`);

    const flightMap = new Map(flights.map((f) => [f.eventId, f]));

    return events.map((event) => ({
      ...event,
      flightDetails: flightMap.get(event.id) ?? null,
    }));
  },

  async getById(eventId: string, tripId: string) {
    const [event] = await db
      .select()
      .from(itineraryEvents)
      .where(and(eq(itineraryEvents.id, eventId), eq(itineraryEvents.tripId, tripId)))
      .limit(1);

    if (!event) return null;

    const [flight] = await db
      .select()
      .from(itineraryFlightDetails)
      .where(eq(itineraryFlightDetails.eventId, eventId))
      .limit(1);

    return { ...event, flightDetails: flight ?? null };
  },

  async create(
    tripId: string,
    userId: string,
    data: {
      title: string;
      category: string;
      status?: string;
      startAt: string;
      endAt?: string;
      location?: string;
      notes?: string;
      flightDetails?: Record<string, string | undefined>;
    },
  ) {
    const [maxOrder] = await db
      .select({ max: sql<number>`COALESCE(MAX(${itineraryEvents.order}), 0)` })
      .from(itineraryEvents)
      .where(eq(itineraryEvents.tripId, tripId));

    const order = (maxOrder?.max ?? 0) + 1;

    const event = (await db
      .insert(itineraryEvents)
      .values({
        tripId,
        title: data.title,
        category: data.category,
        status: data.status ?? 'confirmed',
        startAt: new Date(data.startAt),
        endAt: data.endAt ? new Date(data.endAt) : null,
        location: data.location ?? null,
        notes: data.notes ?? null,
        order,
        createdByUserId: userId,
      } as typeof itineraryEvents.$inferInsert)
      .returning())[0]!;

    let flightDetails = null;
    if (data.category === 'flight' && data.flightDetails) {
      const [flight] = await db
        .insert(itineraryFlightDetails)
        .values({
          eventId: event.id,
          airline: data.flightDetails.airline ?? null,
          flightNumber: data.flightDetails.flightNumber ?? null,
          departureAirport: data.flightDetails.departureAirport ?? null,
          arrivalAirport: data.flightDetails.arrivalAirport ?? null,
          confirmationRef: data.flightDetails.confirmationRef ?? null,
          terminal: data.flightDetails.terminal ?? null,
          gate: data.flightDetails.gate ?? null,
          seat: data.flightDetails.seat ?? null,
          baggageAllowance: data.flightDetails.baggageAllowance ?? null,
        })
        .returning();
      flightDetails = flight ?? null;
    }

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'event_created',
      referenceId: event.id,
      referenceType: 'itinerary_event',
    });

    return { ...event, flightDetails };
  },

  async update(
    eventId: string,
    tripId: string,
    userId: string,
    data: {
      title?: string;
      category?: string;
      status?: string;
      startAt?: string;
      endAt?: string | null;
      location?: string | null;
      notes?: string | null;
      flightDetails?: Record<string, string | undefined> | null;
      version: number;
    },
  ) {
    const updateData: Record<string, unknown> = {
      version: sql`${itineraryEvents.version} + 1`,
      updatedAt: new Date(),
    };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.startAt !== undefined) updateData.startAt = new Date(data.startAt);
    if (data.endAt !== undefined) updateData.endAt = data.endAt ? new Date(data.endAt) : null;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const [updated] = await db
      .update(itineraryEvents)
      .set(updateData)
      .where(
        and(
          eq(itineraryEvents.id, eventId),
          eq(itineraryEvents.tripId, tripId),
          eq(itineraryEvents.version, data.version),
        ),
      )
      .returning();

    if (!updated) {
      const [current] = await db
        .select()
        .from(itineraryEvents)
        .where(and(eq(itineraryEvents.id, eventId), eq(itineraryEvents.tripId, tripId)))
        .limit(1);

      if (!current) {
        const err = new Error('Event not found') as Error & { status: number };
        err.status = 404;
        throw err;
      }

      const err = new Error('Conflict: event was modified by another user') as Error & {
        status: number;
        current: typeof current;
      };
      err.status = 409;
      err.current = current;
      throw err;
    }

    if (data.flightDetails !== undefined) {
      if (data.flightDetails === null) {
        await db
          .delete(itineraryFlightDetails)
          .where(eq(itineraryFlightDetails.eventId, eventId));
      } else {
        await db
          .insert(itineraryFlightDetails)
          .values({
            eventId,
            airline: data.flightDetails.airline ?? null,
            flightNumber: data.flightDetails.flightNumber ?? null,
            departureAirport: data.flightDetails.departureAirport ?? null,
            arrivalAirport: data.flightDetails.arrivalAirport ?? null,
            confirmationRef: data.flightDetails.confirmationRef ?? null,
            terminal: data.flightDetails.terminal ?? null,
            gate: data.flightDetails.gate ?? null,
            seat: data.flightDetails.seat ?? null,
            baggageAllowance: data.flightDetails.baggageAllowance ?? null,
          })
          .onConflictDoUpdate({
            target: itineraryFlightDetails.eventId,
            set: {
              airline: data.flightDetails.airline ?? null,
              flightNumber: data.flightDetails.flightNumber ?? null,
              departureAirport: data.flightDetails.departureAirport ?? null,
              arrivalAirport: data.flightDetails.arrivalAirport ?? null,
              confirmationRef: data.flightDetails.confirmationRef ?? null,
              terminal: data.flightDetails.terminal ?? null,
              gate: data.flightDetails.gate ?? null,
              seat: data.flightDetails.seat ?? null,
              baggageAllowance: data.flightDetails.baggageAllowance ?? null,
            },
          });
      }
    }

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'event_updated',
      referenceId: eventId,
      referenceType: 'itinerary_event',
    });

    const [flight] = await db
      .select()
      .from(itineraryFlightDetails)
      .where(eq(itineraryFlightDetails.eventId, eventId))
      .limit(1);

    return { ...updated, flightDetails: flight ?? null };
  },

  async remove(eventId: string, tripId: string, userId: string) {
    const [deleted] = await db
      .delete(itineraryEvents)
      .where(and(eq(itineraryEvents.id, eventId), eq(itineraryEvents.tripId, tripId)))
      .returning();

    if (!deleted) {
      const err = new Error('Event not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'event_deleted',
      referenceId: eventId,
      referenceType: 'itinerary_event',
    });
  },

  async reorder(tripId: string, events: { id: string; order: number }[]) {
    await db.transaction(async (tx) => {
      for (const event of events) {
        await tx
          .update(itineraryEvents)
          .set({ order: event.order, updatedAt: new Date() })
          .where(
            and(eq(itineraryEvents.id, event.id), eq(itineraryEvents.tripId, tripId)),
          );
      }
    });
  },
};
