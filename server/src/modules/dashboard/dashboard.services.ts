import { db } from '../../common/db.js';
import { trips, tripMembers, tripInvites } from '../../db/index.js';
import { eq, and, count, isNull, lte, gte, gt, sql } from 'drizzle-orm';
import type { DashboardStats } from '../../shared/types.js';

export async function getDashboardStats(
  userId: string,
  userEmail: string,
): Promise<DashboardStats> {
  const now = new Date();

  const memberTrips = db
    .select({ tripId: tripMembers.tripId })
    .from(tripMembers)
    .where(eq(tripMembers.userId, userId));

  const [upcoming] = await db
    .select({ value: count() })
    .from(trips)
    .where(
      and(
        sql`${trips.id} IN ${memberTrips}`,
        gt(trips.startDate, now),
        isNull(trips.archivedAt),
      ),
    );

  const [ongoing] = await db
    .select({ value: count() })
    .from(trips)
    .where(
      and(
        sql`${trips.id} IN ${memberTrips}`,
        lte(trips.startDate, now),
        gte(trips.endDate, now),
        isNull(trips.archivedAt),
      ),
    );

  const [completed] = await db
    .select({ value: count() })
    .from(trips)
    .where(
      and(
        sql`${trips.id} IN ${memberTrips}`,
        sql`${trips.endDate} < ${now}`,
        isNull(trips.archivedAt),
      ),
    );

  const [pending] = await db
    .select({ value: count() })
    .from(tripInvites)
    .where(
      and(eq(tripInvites.invitedEmail, userEmail), eq(tripInvites.status, 'pending')),
    );

  return {
    upcomingTrips: upcoming?.value ?? 0,
    ongoingTrips: ongoing?.value ?? 0,
    completedTrips: completed?.value ?? 0,
    pendingInvites: pending?.value ?? 0,
  };
}
