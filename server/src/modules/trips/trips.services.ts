import { db } from '../../common/db.js';
import { trips, tripMembers, activityLog, user } from '../../db/index.js';
import { eq, and, desc, lt, isNull } from 'drizzle-orm';
import { remindersQueue } from '../../common/queues.js';
import type { TripMemberRole } from '../../shared/enums.js';
import type { TripWithRole, CursorPaginatedResponse } from '../../shared/types.js';

function computeTripStatus(
  startDate: Date,
  endDate: Date,
  archivedAt: Date | null,
): TripWithRole['status'] {
  if (archivedAt) return 'archived';
  const now = new Date();
  if (now < startDate) return 'upcoming';
  if (now >= startDate && now <= endDate) return 'ongoing';
  return 'completed';
}

export async function listUserTrips(userId: string): Promise<TripWithRole[]> {
  const memberships = await db.query.tripMembers.findMany({
    where: eq(tripMembers.userId, userId),
    with: {
      trip: {
        with: {
          members: { columns: { id: true } },
        },
      },
    },
  });

  return memberships.map((m) => ({
    id: m.trip.id,
    name: m.trip.name,
    destination: m.trip.destination,
    startDate: m.trip.startDate.toISOString(),
    endDate: m.trip.endDate.toISOString(),
    description: m.trip.description,
    baseCurrency: m.trip.baseCurrency,
    estimatedBudget: m.trip.estimatedBudget,
    coverImageUrl: m.trip.coverImageUrl,
    archivedAt: m.trip.archivedAt?.toISOString() ?? null,
    createdByUserId: m.trip.createdByUserId,
    createdAt: m.trip.createdAt.toISOString(),
    updatedAt: m.trip.updatedAt.toISOString(),
    role: m.role as TripMemberRole,
    memberCount: m.trip.members.length,
    status: computeTripStatus(m.trip.startDate, m.trip.endDate, m.trip.archivedAt),
  }));
}

export async function createTrip(
  userId: string,
  data: {
    name: string;
    destination: string;
    startDate: string;
    endDate: string;
    description?: string;
    baseCurrency?: string;
    estimatedBudget?: number;
    coverImageUrl?: string;
  },
) {
  const newStart = new Date(data.startDate);
  const newEnd = new Date(data.endDate);

  const existingTrips = await db
    .select({
      id: trips.id,
      name: trips.name,
      startDate: trips.startDate,
      endDate: trips.endDate,
    })
    .from(trips)
    .innerJoin(tripMembers, eq(trips.id, tripMembers.tripId))
    .where(and(eq(tripMembers.userId, userId), isNull(trips.archivedAt)));

  const now = new Date();

  for (const t of existingTrips) {
    const isOngoing = now >= t.startDate && now <= t.endDate;
    const isUpcoming = now < t.startDate;

    if (isOngoing) {
      if (newStart <= t.endDate) {
        const err = new Error(
          `You have an ongoing trip (${t.name}) until ${t.endDate.toLocaleDateString()}. You can only add new trips after this date.`,
        ) as Error & { status: number };
        err.status = 409;
        throw err;
      }
    } else if (isUpcoming) {
      const isEntirelyBefore = newEnd < t.startDate;
      const isEntirelyAfter = newStart > t.endDate;
      if (!isEntirelyBefore && !isEntirelyAfter) {
        const err = new Error(
          `Your new trip overlaps with an upcoming trip (${t.name}) from ${t.startDate.toLocaleDateString()} to ${t.endDate.toLocaleDateString()}. You must choose dates entirely before or entirely after this trip.`,
        ) as Error & { status: number };
        err.status = 409;
        throw err;
      }
    } else {
      const isEntirelyBefore = newEnd < t.startDate;
      const isEntirelyAfter = newStart > t.endDate;
      if (!isEntirelyBefore && !isEntirelyAfter) {
        const err = new Error(
          `Your new trip overlaps with an existing past trip (${t.name}).`,
        ) as Error & { status: number };
        err.status = 409;
        throw err;
      }
    }
  }

  const trip = await db.transaction(async (tx) => {
    const [newTrip] = await tx
      .insert(trips)
      .values({
        name: data.name,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description ?? null,
        baseCurrency: data.baseCurrency ?? 'USD',
        estimatedBudget: data.estimatedBudget?.toString() ?? null,
        coverImageUrl: data.coverImageUrl ?? null,
        createdByUserId: userId,
      })
      .returning();

    await tx.insert(tripMembers).values({
      tripId: newTrip.id,
      userId,
      role: 'organizer',
    });

    await tx.insert(activityLog).values({
      tripId: newTrip.id,
      actorUserId: userId,
      type: 'trip_created',
    });

    return newTrip;
  });

  const startDate = new Date(data.startDate);
  const reminderTime = new Date(startDate.getTime() - 24 * 60 * 60 * 1000);
  const delay = Math.max(0, reminderTime.getTime() - Date.now());

  if (delay > 0) {
    await remindersQueue.add(
      `reminder-trip-${trip.id}-1d`,
      { type: 'trip-departure', tripId: trip.id },
      { delay, jobId: `reminder-trip-${trip.id}-1d` },
    );
  }

  return trip;
}

export async function getTripById(tripId: string, userId: string): Promise<TripWithRole> {
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    with: {
      members: { columns: { id: true } },
    },
  });

  if (!trip) {
    const err = new Error('Trip not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const [membership] = await db
    .select({ role: tripMembers.role })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)))
    .limit(1);

  return {
    id: trip.id,
    name: trip.name,
    destination: trip.destination,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    description: trip.description,
    baseCurrency: trip.baseCurrency,
    estimatedBudget: trip.estimatedBudget,
    coverImageUrl: trip.coverImageUrl,
    archivedAt: trip.archivedAt?.toISOString() ?? null,
    createdByUserId: trip.createdByUserId,
    createdAt: trip.createdAt.toISOString(),
    updatedAt: trip.updatedAt.toISOString(),
    role: (membership?.role ?? 'viewer') as TripMemberRole,
    memberCount: trip.members.length,
    status: computeTripStatus(trip.startDate, trip.endDate, trip.archivedAt),
  };
}

export async function updateTrip(tripId: string, data: Record<string, unknown>) {
  const values: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) values.name = data.name;
  if (data.destination !== undefined) values.destination = data.destination;
  if (data.startDate !== undefined) values.startDate = new Date(data.startDate as string);
  if (data.endDate !== undefined) values.endDate = new Date(data.endDate as string);
  if (data.description !== undefined) values.description = data.description;
  if (data.baseCurrency !== undefined) values.baseCurrency = data.baseCurrency;
  if (data.estimatedBudget !== undefined)
    values.estimatedBudget = data.estimatedBudget !== null ? String(data.estimatedBudget) : null;
  if (data.coverImageUrl !== undefined) values.coverImageUrl = data.coverImageUrl;

  const [updated] = await db.update(trips).set(values).where(eq(trips.id, tripId)).returning();

  if (!updated) {
    const err = new Error('Trip not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return updated;
}

export async function deleteTrip(tripId: string): Promise<void> {
  const [deleted] = await db.delete(trips).where(eq(trips.id, tripId)).returning({ id: trips.id });

  if (!deleted) {
    const err = new Error('Trip not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function archiveTrip(tripId: string): Promise<void> {
  const [result] = await db
    .update(trips)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(trips.id, tripId), isNull(trips.archivedAt)))
    .returning({ id: trips.id });

  if (!result) {
    const existing = await db.query.trips.findFirst({
      where: eq(trips.id, tripId),
      columns: { archivedAt: true },
    });

    if (existing?.archivedAt) {
      const err = new Error('Trip is already archived') as Error & { status: number };
      err.status = 409;
      throw err;
    }

    const err = new Error('Trip not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function restoreTrip(tripId: string): Promise<void> {
  await db
    .update(trips)
    .set({ archivedAt: null, updatedAt: new Date() })
    .where(eq(trips.id, tripId));
}

export async function getActivityFeed(
  tripId: string,
  cursor: string | undefined,
  limit: number,
): Promise<CursorPaginatedResponse<unknown>> {
  const conditions = [eq(activityLog.tripId, tripId)];

  if (cursor) {
    conditions.push(lt(activityLog.createdAt, new Date(cursor)));
  }

  const rows = await db
    .select({
      id: activityLog.id,
      type: activityLog.type,
      referenceId: activityLog.referenceId,
      referenceType: activityLog.referenceType,
      metadata: activityLog.metadata,
      createdAt: activityLog.createdAt,
      actorUserId: activityLog.actorUserId,
      actorName: user.name,
    })
    .from(activityLog)
    .leftJoin(user, eq(activityLog.actorUserId, user.id))
    .where(and(...conditions))
    .orderBy(desc(activityLog.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;

  return { data, nextCursor, hasMore };
}
