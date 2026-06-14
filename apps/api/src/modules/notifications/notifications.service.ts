import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../common/db';
import { notifications, notificationPreferences } from '@wend/db';

export const NotificationsService = {
  async list(
    userId: string,
    status: string | undefined,
    cursor: string | undefined,
    limit: number,
  ) {
    const conditions = [eq(notifications.userId, userId)];

    const validStatuses = ['unread', 'read', 'archived'] as const;
    type NotifStatus = (typeof validStatuses)[number];

    if (status && validStatuses.includes(status as NotifStatus)) {
      conditions.push(eq(notifications.status, status as NotifStatus));
    } else {
      conditions.push(sql`${notifications.status} != 'archived'`);
    }

    if (cursor) {
      conditions.push(sql`${notifications.createdAt} < ${new Date(cursor)}`);
    }

    const rows = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1]!.createdAt.toISOString() : null;

    return { data, nextCursor };
  },

  async unreadCount(userId: string) {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, 'unread'),
        ),
      );

    return result?.count ?? 0;
  },

  async markRead(notificationId: string, userId: string) {
    const [updated] = await db
      .update(notifications)
      .set({ status: 'read' })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      const err = new Error('Notification not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    return updated;
  },

  async markAllRead(userId: string) {
    await db
      .update(notifications)
      .set({ status: 'read' })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, 'unread'),
        ),
      );
  },

  async archive(notificationId: string, userId: string) {
    const [updated] = await db
      .update(notifications)
      .set({ status: 'archived' })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId),
        ),
      )
      .returning();

    if (!updated) {
      const err = new Error('Notification not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    return updated;
  },

  async archiveAllRead(userId: string) {
    await db
      .update(notifications)
      .set({ status: 'archived' })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.status, 'read'),
        ),
      );
  },

  async getPreferences(userId: string) {
    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId));

    return prefs;
  },

  async updatePreferences(
    userId: string,
    preferences: Array<{ type: string; email: boolean }>,
  ) {
    await db.transaction(async (tx) => {
      for (const pref of preferences) {
        await tx
          .insert(notificationPreferences)
          .values({
            userId,
            type: pref.type,
            inApp: true,
            email: pref.email,
          })
          .onConflictDoUpdate({
            target: [notificationPreferences.userId, notificationPreferences.type],
            set: { email: pref.email },
          });
      }
    });

    return this.getPreferences(userId);
  },
};
