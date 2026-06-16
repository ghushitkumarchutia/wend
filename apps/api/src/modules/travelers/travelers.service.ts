import { eq, and, sql } from 'drizzle-orm';
import { randomBytes, createHash } from 'crypto';
import { db } from '../../common/db';
import { emailQueue, notificationsQueue } from '../../common/queues';
import { tripMembers, tripInvites, user, activityLog } from '@wend/db';
import type { TripMemberRole } from '@wend/shared';
import { INVITE_EXPIRY_DAYS } from '@wend/shared';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export const TravelersService = {
  async getMembers(tripId: string) {
    const rows = await db
      .select({
        userId: tripMembers.userId,
        role: tripMembers.role,
        joinedAt: tripMembers.joinedAt,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(tripMembers)
      .innerJoin(user, eq(tripMembers.userId, user.id))
      .where(eq(tripMembers.tripId, tripId));

    return rows.map((r) => ({
      id: `${tripId}_${r.userId}`,
      tripId,
      userId: r.userId,
      role: r.role,
      joinedAt: r.joinedAt,
      user: {
        id: r.userId,
        name: r.name,
        email: r.email,
        image: r.image,
      },
    }));
  },

  async changeRole(tripId: string, targetUserId: string, newRole: TripMemberRole) {
    const [membership] = await db
      .select({ role: tripMembers.role })
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, targetUserId)))
      .limit(1);

    if (!membership) {
      const err = new Error('Member not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (membership.role === 'organizer') {
      const err = new Error(
        'Cannot change the organizer role directly. Use transfer instead.',
      ) as Error & { status: number };
      err.status = 400;
      throw err;
    }

    await db
      .update(tripMembers)
      .set({ role: newRole })
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, targetUserId)));

    return { userId: targetUserId, role: newRole };
  },

  async removeMember(tripId: string, targetUserId: string, actorUserId: string) {
    const [target] = await db
      .select({ role: tripMembers.role })
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, targetUserId)))
      .limit(1);

    if (!target) {
      const err = new Error('Member not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (target.role === 'organizer') {
      const err = new Error('Cannot remove the organizer') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    await db
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, targetUserId)));

    await db.insert(activityLog).values({
      tripId,
      actorUserId,
      type: 'MEMBER_REMOVED',
      referenceId: targetUserId,
      referenceType: 'user',
    });
  },

  async leaveTrip(tripId: string, userId: string) {
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
      const memberCount = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tripMembers)
        .where(eq(tripMembers.tripId, tripId));

      if ((memberCount[0]?.count ?? 0) === 1) {
        const err = new Error(
          'You are the sole member. Archive or delete the trip instead.',
        ) as Error & { status: number };
        err.status = 409;
        throw err;
      }

      const err = new Error(
        'Organizer cannot leave. Transfer the organizer role first.',
      ) as Error & { status: number };
      err.status = 400;
      throw err;
    }

    await db
      .delete(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)));

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'MEMBER_LEFT',
    });
  },

  async transferOrganizer(tripId: string, currentOrgId: string, newOrgId: string) {
    const [target] = await db
      .select({ role: tripMembers.role })
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, newOrgId)))
      .limit(1);

    if (!target) {
      const err = new Error('Target user is not a member') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (target.role === 'organizer') {
      const err = new Error('Target is already the organizer') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    await db.transaction(async (tx) => {
      await tx
        .update(tripMembers)
        .set({ role: 'member' })
        .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, currentOrgId)));

      await tx
        .update(tripMembers)
        .set({ role: 'organizer' })
        .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, newOrgId)));

      await tx.insert(activityLog).values({
        tripId,
        actorUserId: currentOrgId,
        type: 'ORGANIZER_TRANSFERRED',
        referenceId: newOrgId,
        referenceType: 'user',
      });
    });
  },

  async getInvites(tripId: string) {
    return db
      .select({
        id: tripInvites.id,
        invitedEmail: tripInvites.invitedEmail,
        role: tripInvites.role,
        status: tripInvites.status,
        name: tripInvites.name,
        expiresAt: tripInvites.expiresAt,
        createdAt: tripInvites.createdAt,
        inviterName: user.name,
      })
      .from(tripInvites)
      .innerJoin(user, eq(tripInvites.inviterUserId, user.id))
      .where(and(eq(tripInvites.tripId, tripId), eq(tripInvites.status, 'pending')));
  },

  async sendInvite(
    tripId: string,
    inviterUserId: string,
    data: { email: string; role: TripMemberRole; name?: string },
    tripName: string,
    inviterName: string,
    destination: string,
    webOrigin: string,
  ) {
    const [existingMember] = await db
      .select({ userId: tripMembers.userId })
      .from(tripMembers)
      .innerJoin(user, eq(tripMembers.userId, user.id))
      .where(and(eq(tripMembers.tripId, tripId), eq(user.email, data.email)))
      .limit(1);

    if (existingMember) {
      const err = new Error('This user is already a member of this trip.') as Error & {
        status: number;
      };
      err.status = 409;
      throw err;
    }

    const [pendingInvite] = await db
      .select({ id: tripInvites.id })
      .from(tripInvites)
      .where(
        and(
          eq(tripInvites.tripId, tripId),
          eq(tripInvites.invitedEmail, data.email),
          eq(tripInvites.status, 'pending'),
        ),
      )
      .limit(1);

    if (pendingInvite) {
      const err = new Error(
        "There's already a pending invite for this email address. Revoke it first if you'd like to send a new one.",
      ) as Error & { status: number };
      err.status = 409;
      throw err;
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(tripInvites).values({
      tripId,
      invitedEmail: data.email,
      inviterUserId,
      role: data.role,
      name: data.name ?? null,
      tokenHash,
      expiresAt,
    });

    await emailQueue.add('trip-invite', {
      to: data.email,
      type: 'trip-invite',
      inviteeName: data.name ?? data.email,
      inviterName,
      tripName,
      destination,
      role: data.role,
      inviteLink: `${webOrigin}/invites/accept?token=${token}`,
    });

    await db.insert(activityLog).values({
      tripId,
      actorUserId: inviterUserId,
      type: 'INVITE_SENT',
      metadata: { email: data.email, role: data.role },
    });
  },

  async revokeInvite(tripId: string, inviteId: string) {
    const [invite] = await db
      .select({ status: tripInvites.status })
      .from(tripInvites)
      .where(and(eq(tripInvites.id, inviteId), eq(tripInvites.tripId, tripId)))
      .limit(1);

    if (!invite) {
      const err = new Error('Invite not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (invite.status !== 'pending') {
      const err = new Error('Only pending invites can be revoked') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    await db.update(tripInvites).set({ status: 'revoked' }).where(eq(tripInvites.id, inviteId));
  },

  async resendInvite(
    tripId: string,
    inviteId: string,
    inviterUserId: string,
    tripName: string,
    inviterName: string,
    destination: string,
    webOrigin: string,
  ) {
    const [existing] = await db
      .select({
        invitedEmail: tripInvites.invitedEmail,
        role: tripInvites.role,
        name: tripInvites.name,
        status: tripInvites.status,
      })
      .from(tripInvites)
      .where(and(eq(tripInvites.id, inviteId), eq(tripInvites.tripId, tripId)))
      .limit(1);

    if (!existing) {
      const err = new Error('Invite not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (existing.status !== 'pending') {
      const err = new Error('Only pending invites can be resent') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    await db.update(tripInvites).set({ status: 'expired' }).where(eq(tripInvites.id, inviteId));

    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(tripInvites).values({
      tripId,
      invitedEmail: existing.invitedEmail,
      inviterUserId,
      role: existing.role,
      name: existing.name,
      tokenHash,
      expiresAt,
    });

    await emailQueue.add('trip-invite', {
      to: existing.invitedEmail,
      type: 'trip-invite',
      inviteeName: existing.name ?? existing.invitedEmail,
      inviterName,
      tripName,
      destination,
      role: existing.role,
      inviteLink: `${webOrigin}/invites/accept?token=${token}`,
    });
  },

  async acceptInvite(token: string, userId: string) {
    const tokenHash = hashToken(token);

    const [invite] = await db
      .select({
        id: tripInvites.id,
        tripId: tripInvites.tripId,
        role: tripInvites.role,
        status: tripInvites.status,
        expiresAt: tripInvites.expiresAt,
      })
      .from(tripInvites)
      .where(eq(tripInvites.tokenHash, tokenHash))
      .limit(1);

    if (!invite) {
      const err = new Error(
        'This invitation has expired or been cancelled. Ask the organizer to send a new one.',
      ) as Error & { status: number };
      err.status = 400;
      throw err;
    }

    if (invite.status !== 'pending' || invite.expiresAt < new Date()) {
      if (invite.status === 'pending') {
        await db
          .update(tripInvites)
          .set({ status: 'expired' })
          .where(eq(tripInvites.id, invite.id));
      }
      const err = new Error(
        'This invitation has expired or been cancelled. Ask the organizer to send a new one.',
      ) as Error & { status: number };
      err.status = 400;
      throw err;
    }

    const [existingMember] = await db
      .select({ userId: tripMembers.userId })
      .from(tripMembers)
      .where(and(eq(tripMembers.tripId, invite.tripId), eq(tripMembers.userId, userId)))
      .limit(1);

    if (existingMember) {
      await db.update(tripInvites).set({ status: 'accepted' }).where(eq(tripInvites.id, invite.id));
      return { tripId: invite.tripId };
    }

    await db.transaction(async (tx) => {
      await tx.insert(tripMembers).values({
        tripId: invite.tripId,
        userId,
        role: invite.role,
      });

      await tx.update(tripInvites).set({ status: 'accepted' }).where(eq(tripInvites.id, invite.id));

      await tx.insert(activityLog).values({
        tripId: invite.tripId,
        actorUserId: userId,
        type: 'MEMBER_JOINED',
      });
    });

    await notificationsQueue.add('member-joined', {
      tripId: invite.tripId,
      userId,
      type: 'member-joined',
    });

    return { tripId: invite.tripId };
  },

  async declineInvite(token: string) {
    const tokenHash = hashToken(token);

    const [invite] = await db
      .select({ id: tripInvites.id, status: tripInvites.status })
      .from(tripInvites)
      .where(eq(tripInvites.tokenHash, tokenHash))
      .limit(1);

    if (!invite || invite.status !== 'pending') {
      const err = new Error('This invitation has expired or been cancelled.') as Error & {
        status: number;
      };
      err.status = 400;
      throw err;
    }

    await db.update(tripInvites).set({ status: 'declined' }).where(eq(tripInvites.id, invite.id));
  },
};
