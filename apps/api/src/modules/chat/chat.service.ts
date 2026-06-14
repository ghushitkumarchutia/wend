import { eq, and, desc, lt } from 'drizzle-orm';
import { db } from '../../common/db';
import { notificationsQueue } from '../../common/queues';
import { messages, activityLog } from '@wend/db';
import { CHAT_EDIT_WINDOW_MS } from '@wend/shared';

export const ChatService = {
  async list(
    tripId: string,
    cursor: string | undefined,
    limit: number,
  ) {
    const query = db
      .select()
      .from(messages)
      .where(
        cursor
          ? and(
              eq(messages.tripId, tripId),
              lt(messages.createdAt, new Date(cursor)),
            )
          : eq(messages.tripId, tripId),
      )
      .orderBy(desc(messages.createdAt))
      .limit(limit + 1);

    const rows = await query;
    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1]!.createdAt.toISOString() : null;

    return { data, nextCursor };
  },

  async create(tripId: string, userId: string, body: string) {
    const [message] = await db.transaction(async (tx) => {
      const [msg] = await tx
        .insert(messages)
        .values({
          tripId,
          userId,
          body,
        })
        .returning();

      await tx.insert(activityLog).values({
        tripId,
        actorUserId: userId,
        type: 'message_sent',
        referenceId: msg!.id,
        referenceType: 'message',
      });

      return [msg!];
    });

    await notificationsQueue.add('fan-out', {
      activityType: 'message_sent',
      tripId,
      actorUserId: userId,
      referenceId: message.id,
      referenceType: 'message',
    });

    return message;
  },

  async edit(messageId: string, tripId: string, userId: string, body: string) {
    const [existing] = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.tripId, tripId),
        ),
      )
      .limit(1);

    if (!existing || existing.deletedAt) {
      const err = new Error('Message not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (existing.userId !== userId) {
      const err = new Error('Only the sender can edit this message') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    const elapsed = Date.now() - existing.createdAt.getTime();
    if (elapsed > CHAT_EDIT_WINDOW_MS) {
      const err = new Error('Edit window has expired (15 minutes)') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    const [updated] = await db
      .update(messages)
      .set({ body, editedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();

    return updated;
  },

  async softDelete(messageId: string, tripId: string, userId: string, userRole: string) {
    const [existing] = await db
      .select({
        id: messages.id,
        userId: messages.userId,
        deletedAt: messages.deletedAt,
      })
      .from(messages)
      .where(
        and(
          eq(messages.id, messageId),
          eq(messages.tripId, tripId),
        ),
      )
      .limit(1);

    if (!existing || existing.deletedAt) {
      const err = new Error('Message not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (existing.userId !== userId && userRole !== 'organizer') {
      const err = new Error('Only the sender or organizer can delete this message') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    const [deleted] = await db
      .update(messages)
      .set({ deletedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();

    return deleted;
  },
};
