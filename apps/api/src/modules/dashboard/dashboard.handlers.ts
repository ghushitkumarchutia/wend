import type { Request, Response } from 'express';
import { eq, and, sql, count } from 'drizzle-orm';
import { db } from '../../common/db';
import { trips, tripMembers, tripInvites } from '@wend/db';
import { auth } from '../../common/auth';
import { fromNodeHeaders } from 'better-auth/node';
import type { DashboardStats } from '@wend/shared';

export async function getStats(req: Request, res: Response) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    const err = new Error('Unauthorized') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  const userId = session.user.id;
  const userEmail = session.user.email;
  const now = new Date();

  const userTrips = await db
    .select({
      startDate: trips.startDate,
      endDate: trips.endDate,
      archivedAt: trips.archivedAt,
    })
    .from(trips)
    .innerJoin(tripMembers, eq(trips.id, tripMembers.tripId))
    .where(eq(tripMembers.userId, userId));

  let upcomingTrips = 0;
  let ongoingTrips = 0;
  let completedTrips = 0;

  for (const trip of userTrips) {
    if (trip.archivedAt) continue;
    if (now < trip.startDate) upcomingTrips++;
    else if (now <= trip.endDate) ongoingTrips++;
    else completedTrips++;
  }

  const [inviteCount] = await db
    .select({ count: count() })
    .from(tripInvites)
    .where(
      and(
        eq(tripInvites.invitedEmail, userEmail),
        eq(tripInvites.status, 'pending'),
        sql`${tripInvites.expiresAt} > ${now}`,
      ),
    );

  const stats: DashboardStats = {
    upcomingTrips,
    ongoingTrips,
    completedTrips,
    pendingInvites: inviteCount?.count ?? 0,
  };

  res.json({ data: stats });
}
