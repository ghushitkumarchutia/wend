import { db } from '../../common/db.js';
import { getIO } from '../../common/socket.js';
import { messages, user } from '../../db/index.js';
import { CHAT_EDIT_WINDOW_MS } from '../../shared/constants.js';
import { eq, and, desc, lt, isNull } from 'drizzle-orm';
import type { CursorPaginatedResponse } from '../../shared/types.js';

interface MessageRow {
  id: string;
  tripId: string;
  userId: string;
  body: string;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  userName: string;
  userImage: string | null;
}

export async function listMessages(
  tripId: string,
  cursor: string | undefined,
  limit: number,
): Promise<CursorPaginatedResponse<MessageRow>> {
  const conditions = [eq(messages.tripId, tripId)];

  if (cursor) {
    conditions.push(lt(messages.createdAt, new Date(cursor)));
  }

  const rows = await db
    .select({
      id: messages.id,
      tripId: messages.tripId,
      userId: messages.userId,
      body: messages.body,
      editedAt: messages.editedAt,
      deletedAt: messages.deletedAt,
      createdAt: messages.createdAt,
      userName: user.name,
      userImage: user.image,
    })
    .from(messages)
    .leftJoin(user, eq(messages.userId, user.id))
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;

  const formatted = data.map((r) => ({
    id: r.id,
    tripId: r.tripId,
    userId: r.userId,
    body: r.deletedAt ? '' : r.body,
    editedAt: r.editedAt?.toISOString() ?? null,
    deletedAt: r.deletedAt?.toISOString() ?? null,
    createdAt: r.createdAt.toISOString(),
    userName: r.userName ?? 'Unknown',
    userImage: r.userImage ?? null,
  }));

  return { data: formatted, nextCursor, hasMore };
}

export async function createMessage(tripId: string, userId: string, body: string) {
  const [message] = await db
    .insert(messages)
    .values({ tripId, userId, body })
    .returning();

  const sender = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { name: true, image: true },
  });

  const payload = {
    id: message.id,
    tripId: message.tripId,
    userId: message.userId,
    body: message.body,
    editedAt: null,
    deletedAt: null,
    createdAt: message.createdAt.toISOString(),
    userName: sender?.name ?? 'Unknown',
    userImage: sender?.image ?? null,
  };

  getIO().to(`trip:${tripId}`).emit('chat:message:new', payload);

  return payload;
}

export async function editMessage(
  tripId: string,
  messageId: string,
  userId: string,
  newBody: string,
) {
  const existing = await db.query.messages.findFirst({
    where: and(
      eq(messages.id, messageId),
      eq(messages.tripId, tripId),
      isNull(messages.deletedAt),
    ),
  });

  if (!existing) {
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
    err.status = 400;
    throw err;
  }

  const [updated] = await db
    .update(messages)
    .set({ body: newBody, editedAt: new Date() })
    .where(eq(messages.id, messageId))
    .returning();

  const payload = {
    id: updated.id,
    tripId: updated.tripId,
    userId: updated.userId,
    body: updated.body,
    editedAt: updated.editedAt?.toISOString() ?? null,
    createdAt: updated.createdAt.toISOString(),
  };

  getIO().to(`trip:${tripId}`).emit('chat:message:edited', payload);

  return payload;
}

export async function softDeleteMessage(
  tripId: string,
  messageId: string,
  userId: string,
  tripRole: string,
): Promise<void> {
  const existing = await db.query.messages.findFirst({
    where: and(
      eq(messages.id, messageId),
      eq(messages.tripId, tripId),
      isNull(messages.deletedAt),
    ),
  });

  if (!existing) {
    const err = new Error('Message not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (existing.userId !== userId && tripRole !== 'organizer') {
    const err = new Error('Only the sender or organizer can delete') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  await db
    .update(messages)
    .set({ deletedAt: new Date() })
    .where(eq(messages.id, messageId));

  getIO().to(`trip:${tripId}`).emit('chat:message:deleted', {
    messageId,
    tripId,
  });
}
