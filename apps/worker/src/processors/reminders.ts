import { eq, and } from 'drizzle-orm';
import { trips, tripMembers, itineraryEvents, user } from '@wend/db';
import { Queue } from 'bullmq';
import { workerConnection } from '../redis';
import type { Job } from 'bullmq';

const emailQueue = new Queue('email', {
  connection: workerConnection.duplicate() as any,
});

interface ReminderPayload {
  tripId: string;
  type: 'departure' | 'event';
  daysBefore?: number;
  eventId?: string;
}

export async function processReminderJob(job: Job, db: ReturnType<typeof import('drizzle-orm/postgres-js').drizzle>) {
  const payload = job.data as ReminderPayload;

  if (payload.type === 'departure') {
    await processDepartureReminder(payload, db);
  } else if (payload.type === 'event') {
    await processEventReminder(payload, db);
  }
}

async function processDepartureReminder(
  payload: ReminderPayload,
  db: ReturnType<typeof import('drizzle-orm/postgres-js').drizzle>,
) {
  const [trip] = await db
    .select({
      id: trips.id,
      name: trips.name,
      startDate: trips.startDate,
      destination: trips.destination,
    })
    .from(trips)
    .where(eq(trips.id, payload.tripId))
    .limit(1);

  if (!trip) return;

  if (trip.startDate.getTime() < Date.now()) return;

  const members = await db
    .select({
      userId: tripMembers.userId,
    })
    .from(tripMembers)
    .where(eq(tripMembers.tripId, payload.tripId));

  for (const member of members) {
    const [memberUser] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, member.userId))
      .limit(1);

    if (memberUser) {
      await emailQueue.add('departure-reminder', {
        to: memberUser.email,
        userName: memberUser.name,
        type: 'departure-reminder',
        tripName: trip.name,
        destination: trip.destination,
        startDate: trip.startDate.toISOString(),
        daysBefore: payload.daysBefore,
      });
    }
  }
}

async function processEventReminder(
  payload: ReminderPayload,
  db: ReturnType<typeof import('drizzle-orm/postgres-js').drizzle>,
) {
  if (!payload.eventId) return;

  const [event] = await db
    .select({
      id: itineraryEvents.id,
      title: itineraryEvents.title,
      startAt: itineraryEvents.startAt,
      tripId: itineraryEvents.tripId,
      status: itineraryEvents.status,
    })
    .from(itineraryEvents)
    .where(
      and(
        eq(itineraryEvents.id, payload.eventId),
        eq(itineraryEvents.tripId, payload.tripId),
      ),
    )
    .limit(1);

  if (!event || event.status === 'cancelled') return;

  if (event.startAt.getTime() < Date.now()) return;

  const members = await db
    .select({
      userId: tripMembers.userId,
    })
    .from(tripMembers)
    .where(eq(tripMembers.tripId, payload.tripId));

  for (const member of members) {
    const [memberUser] = await db
      .select({ email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, member.userId))
      .limit(1);

    if (memberUser) {
      await emailQueue.add('event-reminder', {
        to: memberUser.email,
        userName: memberUser.name,
        type: 'event-reminder',
        eventTitle: event.title,
        startAt: event.startAt.toISOString(),
      });
    }
  }
}
