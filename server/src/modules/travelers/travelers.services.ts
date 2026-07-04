import { db } from '../../common/db.js';
import { emailQueue } from '../../common/queues.js';
import { trips, tripMembers, tripInvites, activityLog, user } from '../../db/index.js';
import { eq, and } from 'drizzle-orm';
import { INVITE_EXPIRY_DAYS } from '../../shared/constants.js';
import type { MemberWithUser } from '../../shared/types.js';
import type { TripMemberRole } from '../../shared/enums.js';

export async function listTripMembers(tripId: string): Promise<MemberWithUser[]> {
  const rows = await db.query.tripMembers.findMany({
    where: eq(tripMembers.tripId, tripId),
    with: {
      user: {
        columns: { id: true, name: true, email: true, image: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    tripId: r.tripId,
    userId: r.userId,
    role: r.role,
    joinedAt: r.joinedAt.toISOString(),
    user: r.user,
  }));
}

export async function changeMemberRole(
  tripId: string,
  targetUserId: string,
  newRole: TripMemberRole,
  actorId: string,
): Promise<void> {
  if (targetUserId === actorId) {
    const err = new Error('Cannot change your own role') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const [membership] = await db
    .select({ id: tripMembers.id, role: tripMembers.role })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, targetUserId)))
    .limit(1);

  if (!membership) {
    const err = new Error('Member not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (membership.role === 'organizer') {
    const err = new Error('Cannot change organizer role directly — use transfer') as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  await db.update(tripMembers).set({ role: newRole }).where(eq(tripMembers.id, membership.id));

  await db.insert(activityLog).values({
    tripId,
    actorUserId: actorId,
    type: 'role_changed',
    referenceId: targetUserId,
    referenceType: 'user',
    metadata: { newRole },
  });
}

export async function removeTripMember(
  tripId: string,
  targetUserId: string,
  actorId: string,
): Promise<void> {
  if (targetUserId === actorId) {
    const err = new Error('Use the leave endpoint instead') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const [deleted] = await db
    .delete(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, targetUserId)))
    .returning({ id: tripMembers.id });

  if (!deleted) {
    const err = new Error('Member not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  await db.insert(activityLog).values({
    tripId,
    actorUserId: actorId,
    type: 'member_removed',
    referenceId: targetUserId,
    referenceType: 'user',
  });
}

export async function leaveTrip(tripId: string, userId: string): Promise<void> {
  const [membership] = await db
    .select({ role: tripMembers.role })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)))
    .limit(1);

  if (!membership) {
    const err = new Error('Not a member') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (membership.role === 'organizer') {
    const err = new Error('Organizer cannot leave — transfer role first') as Error & {
      status: number;
    };
    err.status = 400;
    throw err;
  }

  await db
    .delete(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)));

  await db.insert(activityLog).values({
    tripId,
    actorUserId: userId,
    type: 'member_left',
  });
}

export async function transferOrganizerRole(
  tripId: string,
  currentOrganizerId: string,
  newOrganizerId: string,
): Promise<void> {
  const [target] = await db
    .select({ id: tripMembers.id })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, newOrganizerId)))
    .limit(1);

  if (!target) {
    const err = new Error('Target user is not a trip member') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  await db
    .update(tripMembers)
    .set({ role: 'member' })
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, currentOrganizerId)));

  await db
    .update(tripMembers)
    .set({ role: 'organizer' })
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, newOrganizerId)));

  await db.insert(activityLog).values({
    tripId,
    actorUserId: currentOrganizerId,
    type: 'organizer_transferred',
    referenceId: newOrganizerId,
    referenceType: 'user',
  });
}

export async function listTripInvites(tripId: string) {
  return db.query.tripInvites.findMany({
    where: and(eq(tripInvites.tripId, tripId), eq(tripInvites.status, 'pending')),
    columns: {
      id: true,
      invitedEmail: true,
      role: true,
      name: true,
      status: true,
      expiresAt: true,
      createdAt: true,
    },
  });
}

export async function createInvite(
  tripId: string,
  inviterUserId: string,
  data: { email: string; role: TripMemberRole; name?: string },
) {
  const token = crypto.randomUUID();
  const tokenHash = await hashToken(token);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

  const [invite] = await db
    .insert(tripInvites)
    .values({
      tripId,
      invitedEmail: data.email,
      inviterUserId,
      role: data.role,
      name: data.name ?? null,
      tokenHash,
      expiresAt,
    })
    .returning();

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { name: true },
  });

  const inviter = await db.query.user.findFirst({
    where: eq(user.id, inviterUserId),
    columns: { name: true },
  });

  await emailQueue.add('trip-invite', {
    to: data.email,
    inviteeName: data.name ?? data.email,
    inviterName: inviter?.name ?? 'Someone',
    tripName: trip?.name ?? 'a trip',
    token,
    type: 'trip-invite',
  });

  return invite;
}

export async function revokeInvite(tripId: string, inviteId: string): Promise<void> {
  const [updated] = await db
    .update(tripInvites)
    .set({ status: 'revoked' })
    .where(
      and(
        eq(tripInvites.id, inviteId),
        eq(tripInvites.tripId, tripId),
        eq(tripInvites.status, 'pending'),
      ),
    )
    .returning({ id: tripInvites.id });

  if (!updated) {
    const err = new Error('Invite not found or already processed') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function resendInviteEmail(tripId: string, inviteId: string): Promise<void> {
  const invite = await db.query.tripInvites.findFirst({
    where: and(
      eq(tripInvites.id, inviteId),
      eq(tripInvites.tripId, tripId),
      eq(tripInvites.status, 'pending'),
    ),
  });

  if (!invite) {
    const err = new Error('Invite not found or already processed') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { name: true },
  });

  const inviter = await db.query.user.findFirst({
    where: eq(user.id, invite.inviterUserId),
    columns: { name: true },
  });

  const newToken = crypto.randomUUID();
  const newTokenHash = await hashToken(newToken);
  const newExpiresAt = new Date();
  newExpiresAt.setDate(newExpiresAt.getDate() + INVITE_EXPIRY_DAYS);

  await db
    .update(tripInvites)
    .set({ tokenHash: newTokenHash, expiresAt: newExpiresAt })
    .where(eq(tripInvites.id, inviteId));

  await emailQueue.add('trip-invite', {
    to: invite.invitedEmail,
    inviteeName: invite.name ?? invite.invitedEmail,
    inviterName: inviter?.name ?? 'Someone',
    tripName: trip?.name ?? 'a trip',
    token: newToken,
    type: 'trip-invite',
  });
}

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
