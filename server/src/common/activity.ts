import { db } from './db.js';
import { getIO } from './socket.js';
import { activityLog, user } from '../db/index.js';
import { eq } from 'drizzle-orm';

interface ActivityData {
  tripId: string;
  actorUserId: string;
  type: string;
  referenceId?: string | null;
  referenceType?: string | null;
  metadata?: Record<string, unknown> | null;
}

export async function logAndEmitActivity(data: ActivityData): Promise<void> {
  const [entry] = await db
    .insert(activityLog)
    .values({
      tripId: data.tripId,
      actorUserId: data.actorUserId,
      type: data.type,
      referenceId: data.referenceId ?? null,
      referenceType: data.referenceType ?? null,
      metadata: data.metadata ?? null,
    })
    .returning();

  const actor = await db.query.user.findFirst({
    where: eq(user.id, data.actorUserId),
    columns: { id: true, name: true, image: true },
  });

  const payload = {
    id: entry.id,
    tripId: entry.tripId,
    actorUserId: entry.actorUserId,
    type: entry.type,
    referenceId: entry.referenceId,
    referenceType: entry.referenceType,
    metadata: entry.metadata,
    createdAt: entry.createdAt.toISOString(),
    actor: actor ? { id: actor.id, name: actor.name, image: actor.image } : null,
  };

  getIO().to(`trip:${data.tripId}`).emit('activity:new', payload);
}

export async function logActivityInTx(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  data: ActivityData,
): Promise<() => Promise<void>> {
  const [entry] = await tx
    .insert(activityLog)
    .values({
      tripId: data.tripId,
      actorUserId: data.actorUserId,
      type: data.type,
      referenceId: data.referenceId ?? null,
      referenceType: data.referenceType ?? null,
      metadata: data.metadata ?? null,
    })
    .returning();

  return async () => {
    const actor = await db.query.user.findFirst({
      where: eq(user.id, data.actorUserId),
      columns: { id: true, name: true, image: true },
    });

    const payload = {
      id: entry.id,
      tripId: entry.tripId,
      actorUserId: entry.actorUserId,
      type: entry.type,
      referenceId: entry.referenceId,
      referenceType: entry.referenceType,
      metadata: entry.metadata,
      createdAt: entry.createdAt.toISOString(),
      actor: actor ? { id: actor.id, name: actor.name, image: actor.image } : null,
    };

    getIO().to(`trip:${data.tripId}`).emit('activity:new', payload);
  };
}
