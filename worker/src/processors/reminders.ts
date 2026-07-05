import type { Job } from 'bullmq';
import { Queue } from 'bullmq';
import postgres from 'postgres';
import { workerRedisUrl } from '../redis.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

const sql = postgres(databaseUrl);

const emailQueue = new Queue('email', { connection: { url: workerRedisUrl } });

interface ReminderJobData {
  type: 'trip-departure' | 'event';
  tripId?: string;
  eventId?: string;
}

export async function processReminderJob(job: Job<ReminderJobData>): Promise<void> {
  const data = job.data;

  if (data.type === 'trip-departure' && data.tripId) {
    const [trip] = await sql`
      SELECT id, name, start_date
      FROM trips
      WHERE id = ${data.tripId}
      LIMIT 1
    `;

    if (!trip) return;

    const members = await sql`
      SELECT tm.user_id, u.email, u.name
      FROM trip_members tm
      INNER JOIN "user" u ON tm.user_id = u.id
      WHERE tm.trip_id = ${trip.id}
    `;

    for (const member of members) {
      if (!member.email) continue;

      await emailQueue.add(`departure-reminder-${trip.id}-${member.user_id}`, {
        to: member.email,
        userName: member.name,
        type: 'trip-departure-reminder' as const,
        tripName: trip.name,
        url: `${process.env.WEB_ORIGIN ?? 'http://localhost:5173'}/trips/${trip.id}`,
      });
    }
  }

  if (data.type === 'event' && data.eventId) {
    const [event] = await sql`
      SELECT id, trip_id, title
      FROM itinerary_events
      WHERE id = ${data.eventId}
      LIMIT 1
    `;

    if (!event) return;

    const [trip] = await sql`
      SELECT id, name
      FROM trips
      WHERE id = ${event.trip_id}
      LIMIT 1
    `;

    if (!trip) return;

    const members = await sql`
      SELECT tm.user_id, u.email, u.name
      FROM trip_members tm
      INNER JOIN "user" u ON tm.user_id = u.id
      WHERE tm.trip_id = ${trip.id}
    `;

    for (const member of members) {
      if (!member.email) continue;

      await emailQueue.add(`event-reminder-${event.id}-${member.user_id}`, {
        to: member.email,
        userName: member.name,
        type: 'event-reminder' as const,
        tripName: trip.name,
        eventTitle: event.title,
        url: `${process.env.WEB_ORIGIN ?? 'http://localhost:5173'}/trips/${trip.id}`,
      });
    }
  }
}
