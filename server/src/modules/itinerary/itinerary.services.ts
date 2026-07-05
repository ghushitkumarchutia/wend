import { db } from '../../common/db.js';
import { getIO } from '../../common/socket.js';
import { itineraryEvents, itineraryFlightDetails, activityLog } from '../../db/index.js';
import { eq, and, asc } from 'drizzle-orm';
import type { ItineraryEventWithDetails } from '../../shared/types.js';

function formatEvent(
  row: typeof itineraryEvents.$inferSelect & {
    flightDetails?: typeof itineraryFlightDetails.$inferSelect | null;
  },
): ItineraryEventWithDetails {
  return {
    id: row.id,
    tripId: row.tripId,
    title: row.title,
    category: row.category as ItineraryEventWithDetails['category'],
    status: row.status as ItineraryEventWithDetails['status'],
    startAt: row.startAt.toISOString(),
    endAt: row.endAt?.toISOString() ?? null,
    location: row.location,
    notes: row.notes,
    order: row.order,
    version: row.version,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    flightDetails: row.flightDetails
      ? {
          id: row.flightDetails.id,
          eventId: row.flightDetails.eventId,
          airline: row.flightDetails.airline,
          flightNumber: row.flightDetails.flightNumber,
          departureAirport: row.flightDetails.departureAirport,
          arrivalAirport: row.flightDetails.arrivalAirport,
          confirmationRef: row.flightDetails.confirmationRef,
          terminal: row.flightDetails.terminal,
          gate: row.flightDetails.gate,
          seat: row.flightDetails.seat,
          baggageAllowance: row.flightDetails.baggageAllowance,
        }
      : null,
  };
}

export async function listEvents(tripId: string): Promise<ItineraryEventWithDetails[]> {
  const rows = await db.query.itineraryEvents.findMany({
    where: eq(itineraryEvents.tripId, tripId),
    orderBy: [asc(itineraryEvents.startAt), asc(itineraryEvents.order)],
    with: { flightDetails: true },
  });

  return rows.map(formatEvent);
}

export async function getEventById(
  tripId: string,
  eventId: string,
): Promise<ItineraryEventWithDetails> {
  const row = await db.query.itineraryEvents.findFirst({
    where: and(eq(itineraryEvents.id, eventId), eq(itineraryEvents.tripId, tripId)),
    with: { flightDetails: true },
  });

  if (!row) {
    const err = new Error('Event not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return formatEvent(row);
}

export async function createEvent(
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
  const [event] = await db
    .insert(itineraryEvents)
    .values({
      tripId,
      title: data.title,
      category: data.category as typeof itineraryEvents.$inferInsert.category,
      status: (data.status ?? 'confirmed') as typeof itineraryEvents.$inferInsert.status,
      startAt: new Date(data.startAt),
      endAt: data.endAt ? new Date(data.endAt) : null,
      location: data.location ?? null,
      notes: data.notes ?? null,
      createdByUserId: userId,
    })
    .returning();

  if (data.flightDetails && data.category === 'flight') {
    await db.insert(itineraryFlightDetails).values({
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
    });
  }

  await db.insert(activityLog).values({
    tripId,
    actorUserId: userId,
    type: 'event_created',
    referenceId: event.id,
    referenceType: 'itinerary_event',
  });

  getIO().to(`trip:${tripId}`).emit('activity:new', {
    type: 'event_created',
    tripId,
    referenceId: event.id,
  });

  return event;
}

export async function updateEvent(
  tripId: string,
  eventId: string,
  userId: string,
  data: Record<string, unknown>,
) {
  const existing = await db.query.itineraryEvents.findFirst({
    where: and(eq(itineraryEvents.id, eventId), eq(itineraryEvents.tripId, tripId)),
  });

  if (!existing) {
    const err = new Error('Event not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (existing.version !== (data.version as number)) {
    const err = new Error('Version conflict — reload and try again') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const values: Record<string, unknown> = {
    version: existing.version + 1,
    updatedAt: new Date(),
  };

  if (data.title !== undefined) values.title = data.title;
  if (data.category !== undefined) values.category = data.category;
  if (data.status !== undefined) values.status = data.status;
  if (data.startAt !== undefined) values.startAt = new Date(data.startAt as string);
  if (data.endAt !== undefined)
    values.endAt = data.endAt !== null ? new Date(data.endAt as string) : null;
  if (data.location !== undefined) values.location = data.location;
  if (data.notes !== undefined) values.notes = data.notes;

  const [updated] = await db
    .update(itineraryEvents)
    .set(values)
    .where(eq(itineraryEvents.id, eventId))
    .returning();

  if (data.flightDetails !== undefined) {
    await db.delete(itineraryFlightDetails).where(eq(itineraryFlightDetails.eventId, eventId));

    if (data.flightDetails !== null) {
      const fd = data.flightDetails as Record<string, string | undefined>;
      await db.insert(itineraryFlightDetails).values({
        eventId,
        airline: fd.airline ?? null,
        flightNumber: fd.flightNumber ?? null,
        departureAirport: fd.departureAirport ?? null,
        arrivalAirport: fd.arrivalAirport ?? null,
        confirmationRef: fd.confirmationRef ?? null,
        terminal: fd.terminal ?? null,
        gate: fd.gate ?? null,
        seat: fd.seat ?? null,
        baggageAllowance: fd.baggageAllowance ?? null,
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

  return updated;
}

export async function deleteEvent(tripId: string, eventId: string, userId: string): Promise<void> {
  const [deleted] = await db
    .delete(itineraryEvents)
    .where(and(eq(itineraryEvents.id, eventId), eq(itineraryEvents.tripId, tripId)))
    .returning({ id: itineraryEvents.id });

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
}

export async function reorderEvents(
  tripId: string,
  events: Array<{ id: string; order: number }>,
): Promise<void> {
  for (const item of events) {
    await db
      .update(itineraryEvents)
      .set({ order: item.order })
      .where(and(eq(itineraryEvents.id, item.id), eq(itineraryEvents.tripId, tripId)));
  }
}
