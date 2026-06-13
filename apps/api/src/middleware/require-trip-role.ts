import type { Request, Response, NextFunction } from 'express';
import { eq, and } from 'drizzle-orm';
import { db } from '../common/db';
import { tripMembers } from '@wend/db';
import type { TripMemberRole } from '@wend/shared';

const ROLE_HIERARCHY: Record<TripMemberRole, number> = {
  organizer: 3,
  member: 2,
  viewer: 1,
};

export function requireTripRole(...allowedRoles: TripMemberRole[]) {
  const minLevel = Math.min(...allowedRoles.map((r) => ROLE_HIERARCHY[r]));

  return async (req: Request, _res: Response, next: NextFunction) => {
    const userId = (req as Request & { user?: { id?: string } }).user?.id;
    if (!userId) {
      const err = new Error('Unauthorized') as Error & { status: number };
      err.status = 401;
      throw err;
    }

    const tripId = req.params.tripId as string;
    if (!tripId) {
      const err = new Error('Trip ID is required') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    const [membership] = await db
      .select({
        role: tripMembers.role,
      })
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)))
      .limit(1);

    if (!membership) {
      const err = new Error('Not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    const memberLevel = ROLE_HIERARCHY[membership.role as TripMemberRole];
    if (memberLevel < minLevel) {
      const err = new Error('Forbidden') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    (req as Request & { tripRole: TripMemberRole }).tripRole =
      membership.role as TripMemberRole;
    next();
  };
}
