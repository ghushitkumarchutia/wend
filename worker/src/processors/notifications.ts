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

interface NotificationJobData {
  type: string;
  tripId: string;
  tripName: string;
  actorUserId: string;
  actorName: string;
  referenceId?: string;
  referenceType?: string;
  metadata?: Record<string, unknown>;
}

export async function processNotificationJob(job: Job<NotificationJobData>): Promise<void> {
  const data = job.data;

  const members = await sql`
    SELECT tm.user_id, u.email, u.name
    FROM trip_members tm
    INNER JOIN "user" u ON tm.user_id = u.id
    WHERE tm.trip_id = ${data.tripId}
  `;

  const recipients = members.filter((m) => m.user_id !== data.actorUserId);

  for (const recipient of recipients) {
    const [preference] = await sql`
      SELECT in_app, email
      FROM notification_preferences
      WHERE user_id = ${recipient.user_id} AND type = ${data.type}
      LIMIT 1
    `;

    const inApp = preference?.in_app ?? true;
    const sendEmail = preference?.email ?? false;

    if (inApp) {
      await sql`
        INSERT INTO notifications (id, user_id, type, trip_id, trip_name, reference_id, reference_type, actor_name, metadata, status, created_at)
        VALUES (
          gen_random_uuid(),
          ${recipient.user_id},
          ${data.type},
          ${data.tripId},
          ${data.tripName},
          ${data.referenceId ?? null},
          ${data.referenceType ?? null},
          ${data.actorName},
          ${data.metadata ? JSON.stringify(data.metadata) : null}::jsonb,
          'unread',
          NOW()
        )
      `;
    }

    if (sendEmail && recipient.email) {
      await emailQueue.add(`notification-email-${data.type}`, {
        to: recipient.email,
        userName: recipient.name,
        type: 'notification' as const,
        tripName: data.tripName,
        actorName: data.actorName,
        action: data.type,
        subject: `${data.actorName} — ${data.type.replace(/_/g, ' ')} in "${data.tripName}"`,
      });
    }
  }
}
