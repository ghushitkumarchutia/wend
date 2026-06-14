import { eq, and } from 'drizzle-orm';
import {
  notifications,
  notificationPreferences,
  tripMembers,
  user,
} from '@wend/db';
import { Queue } from 'bullmq';
import { workerConnection } from '../redis';
import type { Job } from 'bullmq';

const emailQueue = new Queue('email', {
  connection: workerConnection.duplicate() as any,
});

interface FanOutPayload {
  activityType: string;
  tripId: string;
  actorUserId: string;
  referenceId: string;
  referenceType: string;
}

export async function processNotificationJob(job: Job, db: ReturnType<typeof import('drizzle-orm/postgres-js').drizzle>) {
  const payload = job.data as FanOutPayload;
  const { activityType, tripId, actorUserId, referenceId, referenceType } = payload;

  const members = await db
    .select({
      userId: tripMembers.userId,
    })
    .from(tripMembers)
    .where(eq(tripMembers.tripId, tripId));

  const recipientIds = members
    .map((m) => m.userId)
    .filter((id) => id !== actorUserId);

  if (recipientIds.length === 0) return;

  const [actor] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, actorUserId))
    .limit(1);

  const actorName = actor?.name ?? 'Someone';

  const notificationTypeMap: Record<string, string> = {
    member_joined: 'member_joined',
    member_left: 'member_left',
    member_removed: 'member_removed',
    role_changed: 'role_changed',
    organizer_transferred: 'organizer_transferred',
    event_created: 'event_created',
    event_updated: 'event_updated',
    event_deleted: 'event_cancelled',
    expense_added: 'expense_added',
    expense_updated: 'expense_updated',
    settlement_recorded: 'settlement_recorded',
    message_sent: 'message_mention',
    poll_created: 'poll_created',
    poll_closed: 'poll_closed',
    poll_vote_cast: 'poll_vote_changed',
    document_uploaded: 'document_uploaded',
    document_deleted: 'document_deleted',
  };

  const notificationType = notificationTypeMap[activityType] ?? activityType;

  const notificationValues = recipientIds.map((userId) => ({
    userId,
    type: notificationType,
    tripId,
    referenceId,
    referenceType,
    actorName,
  }));

  await db.insert(notifications).values(notificationValues);

  const preferences = await db
    .select({
      userId: notificationPreferences.userId,
      type: notificationPreferences.type,
      email: notificationPreferences.email,
    })
    .from(notificationPreferences)
    .where(
      and(
        eq(notificationPreferences.type, notificationType),
      ),
    );

  const prefsMap = new Map(preferences.map((p) => [p.userId, p]));

  for (const recipientId of recipientIds) {
    const pref = prefsMap.get(recipientId);
    if (pref?.email) {
      const [recipientUser] = await db
        .select({ email: user.email, name: user.name })
        .from(user)
        .where(eq(user.id, recipientId))
        .limit(1);

      if (recipientUser) {
        await emailQueue.add('notification-email', {
          to: recipientUser.email,
          userName: recipientUser.name,
          type: 'notification',
          notificationType,
          actorName,
          tripId,
        });
      }
    }
  }
}
