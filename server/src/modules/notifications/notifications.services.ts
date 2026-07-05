import { db } from '../../common/db.js';
import { notifications, notificationPreferences } from '../../db/index.js';
import { eq, and, desc, lt, sql } from 'drizzle-orm';
import type { CursorPaginatedResponse, NotificationWithMeta } from '../../shared/types.js';

export async function listNotifications(
  userId: string,
  cursor: string | undefined,
  limit: number,
): Promise<CursorPaginatedResponse<NotificationWithMeta>> {
  const conditions = [
    eq(notifications.userId, userId),
    sql`${notifications.status} != 'archived'`,
  ];

  if (cursor) {
    conditions.push(lt(notifications.createdAt, new Date(cursor)));
  }

  const rows = await db
    .select()
    .from(notifications)
    .where(and(...conditions))
    .orderBy(desc(notifications.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;

  const formatted: NotificationWithMeta[] = data.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type as NotificationWithMeta['type'],
    tripId: n.tripId,
    tripName: n.tripName,
    referenceId: n.referenceId,
    referenceType: n.referenceType,
    actorName: n.actorName,
    status: n.status as NotificationWithMeta['status'],
    metadata: n.metadata as Record<string, unknown> | null,
    createdAt: n.createdAt.toISOString(),
  }));

  return { data: formatted, nextCursor, hasMore };
}

export async function getUnreadCount(userId: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.status, 'unread')));

  return result?.count ?? 0;
}

export async function markAsRead(userId: string, notificationId: string): Promise<void> {
  const [updated] = await db
    .update(notifications)
    .set({ status: 'read' })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
        eq(notifications.status, 'unread'),
      ),
    )
    .returning({ id: notifications.id });

  if (!updated) {
    const err = new Error('Notification not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function markAllAsRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ status: 'read' })
    .where(and(eq(notifications.userId, userId), eq(notifications.status, 'unread')));
}

export async function archiveOne(userId: string, notificationId: string): Promise<void> {
  const [updated] = await db
    .update(notifications)
    .set({ status: 'archived' })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    )
    .returning({ id: notifications.id });

  if (!updated) {
    const err = new Error('Notification not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function archiveAllRead(userId: string): Promise<void> {
  await db
    .update(notifications)
    .set({ status: 'archived' })
    .where(and(eq(notifications.userId, userId), eq(notifications.status, 'read')));
}

export async function getUserPreferences(userId: string) {
  return db.query.notificationPreferences.findMany({
    where: eq(notificationPreferences.userId, userId),
    columns: { type: true, inApp: true, email: true },
  });
}

export async function upsertPreferences(
  userId: string,
  preferences: Array<{ type: string; inApp?: boolean; email?: boolean }>,
): Promise<void> {
  for (const pref of preferences) {
    const existing = await db.query.notificationPreferences.findFirst({
      where: and(
        eq(notificationPreferences.userId, userId),
        eq(notificationPreferences.type, pref.type),
      ),
      columns: { id: true },
    });

    if (existing) {
      const values: Record<string, unknown> = {};
      if (pref.inApp !== undefined) values.inApp = pref.inApp;
      if (pref.email !== undefined) values.email = pref.email;
      await db
        .update(notificationPreferences)
        .set(values)
        .where(eq(notificationPreferences.id, existing.id));
    } else {
      await db.insert(notificationPreferences).values({
        userId,
        type: pref.type,
        inApp: pref.inApp ?? true,
        email: pref.email ?? false,
      });
    }
  }
}
