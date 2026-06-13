import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../../common/db';
import { remindersQueue } from '../../common/queues';
import { getPresignedPutUrl } from '../../common/storage';
import { trips, tripMembers } from '@wend/db';
import type { TripMemberRole } from '@wend/shared';

function computeStatus(
  startDate: Date,
  endDate: Date,
  archivedAt: Date | null,
): 'upcoming' | 'ongoing' | 'completed' | 'archived' {
  if (archivedAt) return 'archived';
  const now = new Date();
  if (now < startDate) return 'upcoming';
  if (now <= endDate) return 'ongoing';
  return 'completed';
}

export const TripsService = {
  async create(
    userId: string,
    data: {
      name: string;
      destination: string;
      startDate: string;
      endDate: string;
      description?: string;
      baseCurrency?: string;
      estimatedBudget?: number;
    },
  ) {
    const tripId = crypto.randomUUID();

    const trip = (await db
      .insert(trips)
      .values({
        id: tripId,
        name: data.name,
        destination: data.destination,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        description: data.description ?? null,
        baseCurrency: data.baseCurrency ?? 'USD',
        estimatedBudget: data.estimatedBudget?.toString() ?? null,
        createdByUserId: userId,
      })
      .returning())![0]!;

    await db.insert(tripMembers).values({
      tripId,
      userId,
      role: 'organizer',
    });

    const daysBefore = Math.ceil(
      (new Date(data.startDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (daysBefore >= 1) {
      const remindAt = new Date(
        new Date(data.startDate).getTime() - 24 * 60 * 60 * 1000,
      );
      await remindersQueue.add(
        'trip-departure',
        { tripId, tripName: data.name },
        {
          jobId: `trip-departure-${tripId}`,
          delay: Math.max(0, remindAt.getTime() - Date.now()),
        },
      );
    }

    return {
      ...trip,
      role: 'organizer' as TripMemberRole,
      memberCount: 1,
      status: computeStatus(trip.startDate, trip.endDate, trip.archivedAt),
    };
  },

  async list(
    userId: string,
    filters: {
      status?: string;
      search?: string;
      sort?: string;
    },
  ) {
    const membershipSq = db
      .select({
        tripId: tripMembers.tripId,
        role: tripMembers.role,
      })
      .from(tripMembers)
      .where(eq(tripMembers.userId, userId))
      .as('membership');

    const memberCountSq = db
      .select({
        tripId: tripMembers.tripId,
        count: sql<number>`count(*)::int`.as('count'),
      })
      .from(tripMembers)
      .groupBy(tripMembers.tripId)
      .as('member_count');

    let query = db
      .select({
        id: trips.id,
        name: trips.name,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        description: trips.description,
        baseCurrency: trips.baseCurrency,
        estimatedBudget: trips.estimatedBudget,
        coverImageUrl: trips.coverImageUrl,
        archivedAt: trips.archivedAt,
        createdByUserId: trips.createdByUserId,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
        role: membershipSq.role,
        memberCount: memberCountSq.count,
      })
      .from(trips)
      .innerJoin(membershipSq, eq(trips.id, membershipSq.tripId))
      .leftJoin(memberCountSq, eq(trips.id, memberCountSq.tripId))
      .$dynamic();

    if (filters.search) {
      const term = `%${filters.search}%`;
      query = query.where(
        sql`(${trips.name} ILIKE ${term} OR ${trips.destination} ILIKE ${term})`,
      );
    }

    if (filters.sort === 'name') {
      query = query.orderBy(trips.name);
    } else if (filters.sort === 'startDate') {
      query = query.orderBy(trips.startDate);
    } else {
      query = query.orderBy(desc(trips.updatedAt));
    }

    const rows = await query;

    return rows
      .filter((row) => {
        const status = computeStatus(
          row.startDate,
          row.endDate,
          row.archivedAt,
        );
        if (filters.status && filters.status !== 'all') {
          return status === filters.status;
        }
        return status !== 'archived';
      })
      .map((row) => ({
        ...row,
        memberCount: row.memberCount ?? 1,
        status: computeStatus(row.startDate, row.endDate, row.archivedAt),
      }));
  },

  async getById(tripId: string, userId: string) {
    const memberCountSq = db
      .select({
        tripId: tripMembers.tripId,
        count: sql<number>`count(*)::int`.as('count'),
      })
      .from(tripMembers)
      .groupBy(tripMembers.tripId)
      .as('member_count');

    const [row] = await db
      .select({
        id: trips.id,
        name: trips.name,
        destination: trips.destination,
        startDate: trips.startDate,
        endDate: trips.endDate,
        description: trips.description,
        baseCurrency: trips.baseCurrency,
        estimatedBudget: trips.estimatedBudget,
        coverImageUrl: trips.coverImageUrl,
        archivedAt: trips.archivedAt,
        createdByUserId: trips.createdByUserId,
        createdAt: trips.createdAt,
        updatedAt: trips.updatedAt,
        role: tripMembers.role,
        memberCount: memberCountSq.count,
      })
      .from(trips)
      .innerJoin(
        tripMembers,
        and(eq(tripMembers.tripId, trips.id), eq(tripMembers.userId, userId)),
      )
      .leftJoin(memberCountSq, eq(trips.id, memberCountSq.tripId))
      .where(eq(trips.id, tripId))
      .limit(1);

    if (!row) return null;

    return {
      ...row,
      memberCount: row.memberCount ?? 1,
      status: computeStatus(row.startDate, row.endDate, row.archivedAt),
    };
  },

  async update(
    tripId: string,
    data: {
      name?: string;
      destination?: string;
      startDate?: string;
      endDate?: string;
      description?: string | null;
      baseCurrency?: string;
      estimatedBudget?: number | null;
      coverImageUrl?: string | null;
    },
    force?: boolean,
  ) {
    if (data.startDate || data.endDate) {
      const [existing] = await db
        .select({ startDate: trips.startDate, endDate: trips.endDate })
        .from(trips)
        .where(eq(trips.id, tripId))
        .limit(1);

      if (existing && !force) {
        const newStart = data.startDate
          ? new Date(data.startDate)
          : existing.startDate;
        const newEnd = data.endDate
          ? new Date(data.endDate)
          : existing.endDate;

        const { itineraryEvents } = await import('@wend/db');

        const conflicting = await db
          .select({ id: itineraryEvents.id })
          .from(itineraryEvents)
          .where(
            and(
              eq(itineraryEvents.tripId, tripId),
              sql`${itineraryEvents.startAt} < ${newStart} OR ${itineraryEvents.startAt} > ${newEnd}`,
            ),
          );

        if (conflicting.length > 0) {
          const err = new Error('Date change conflicts with existing events') as Error & {
            status: number;
            conflictingEventIds: string[];
          };
          err.status = 409;
          err.conflictingEventIds = conflicting.map((e) => e.id);
          throw err;
        }
      }
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.destination !== undefined) updateData.destination = data.destination;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.description !== undefined) updateData.description = data.description;
    if (data.baseCurrency !== undefined) updateData.baseCurrency = data.baseCurrency;
    if (data.estimatedBudget !== undefined)
      updateData.estimatedBudget = data.estimatedBudget?.toString() ?? null;
    if (data.coverImageUrl !== undefined) updateData.coverImageUrl = data.coverImageUrl;

    const [updated] = await db
      .update(trips)
      .set(updateData)
      .where(eq(trips.id, tripId))
      .returning();

    return updated;
  },

  async remove(tripId: string) {
    await db.delete(trips).where(eq(trips.id, tripId));
  },

  async archive(tripId: string) {
    const [updated] = await db
      .update(trips)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(trips.id, tripId))
      .returning();
    return updated;
  },

  async restore(tripId: string) {
    const [updated] = await db
      .update(trips)
      .set({ archivedAt: null, updatedAt: new Date() })
      .where(eq(trips.id, tripId))
      .returning();
    return updated;
  },

  async getCoverUploadUrl(tripId: string, contentType: string) {
    const key = `trips/${tripId}/cover.${contentType.split('/')[1] ?? 'jpg'}`;
    const url = await getPresignedPutUrl(key, contentType);
    return { url, key };
  },
};
