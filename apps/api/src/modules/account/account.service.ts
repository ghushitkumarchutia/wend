import { eq, and, sql } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { db } from '../../common/db';
import { getPresignedPutUrl } from '../../common/storage';
import { emailQueue } from '../../common/queues';
import {
  user,
  session,
  account,
  tripMembers,
  messages,
  expenses,
  tripDocuments,
} from '@wend/db';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hash, 'hex');
  return timingSafeEqual(derived, storedBuf);
}

export const AccountService = {
  async getProfile(userId: string) {
    const [profile] = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!profile) {
      const err = new Error('User not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    const [tripStats] = await db
      .select({
        totalTrips: sql<number>`count(*)::int`,
        createdTrips: sql<number>`count(*) FILTER (WHERE ${tripMembers.role} = 'organizer')::int`,
      })
      .from(tripMembers)
      .where(eq(tripMembers.userId, userId));

    const connectedAccounts = await db
      .select({
        providerId: account.providerId,
        accountId: account.accountId,
      })
      .from(account)
      .where(eq(account.userId, userId));

    return {
      ...profile,
      stats: {
        totalTrips: tripStats?.totalTrips ?? 0,
        createdTrips: tripStats?.createdTrips ?? 0,
      },
      connectedAccounts: connectedAccounts.map((a) => ({
        provider: a.providerId,
        accountId: a.accountId,
      })),
    };
  },

  async updateProfile(userId: string, data: { name: string }) {
    const [updated] = await db
      .update(user)
      .set({ name: data.name, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning();

    if (!updated) {
      const err = new Error('User not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    return updated;
  },

  async requestPhotoUrl(userId: string, fileType: string, sizeBytes: number) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      const err = new Error('Unsupported image type') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    if (sizeBytes > 2 * 1024 * 1024) {
      const err = new Error('Image exceeds 2MB limit') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    const ext = fileType.split('/')[1] ?? 'jpg';
    const key = `users/${userId}/avatar/${crypto.randomUUID()}.${ext}`;
    const url = await getPresignedPutUrl(key, fileType, 900);

    return { url, key };
  },

  async confirmPhoto(userId: string, storageKey: string) {
    const [updated] = await db
      .update(user)
      .set({ image: storageKey, updatedAt: new Date() })
      .where(eq(user.id, userId))
      .returning();

    return updated;
  },

  async changeEmail(userId: string, newEmail: string, currentPassword: string) {
    const [existingUser] = await db
      .select({ email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!existingUser) {
      const err = new Error('User not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    const [credentialAccount] = await db
      .select({ password: account.password })
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential'),
        ),
      )
      .limit(1);

    if (!credentialAccount?.password) {
      const err = new Error('No password set — cannot verify identity') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    const isValid = await verifyPassword(currentPassword, credentialAccount.password);
    if (!isValid) {
      const err = new Error('Current password is incorrect') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    const [conflict] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, newEmail))
      .limit(1);

    if (conflict) {
      const err = new Error('Email address is already in use') as Error & { status: number };
      err.status = 409;
      throw err;
    }

    await emailQueue.add('email-change-verification', {
      to: newEmail,
      userId,
      type: 'email-change-verification',
    });

    return { pendingEmail: newEmail };
  },

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const [credentialAccount] = await db
      .select({ id: account.id, password: account.password })
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential'),
        ),
      )
      .limit(1);

    if (!credentialAccount?.password) {
      const err = new Error('No password set — use "Set password" instead') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    const isValid = await verifyPassword(currentPassword, credentialAccount.password);
    if (!isValid) {
      const err = new Error('Current password is incorrect') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    const hashedPassword = await hashPassword(newPassword);

    await db
      .update(account)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(account.id, credentialAccount.id));

    await db
      .delete(session)
      .where(
        and(
          eq(session.userId, userId),
          sql`${session.id} != (SELECT id FROM session WHERE user_id = ${userId} ORDER BY updated_at DESC LIMIT 1)`,
        ),
      );

    await emailQueue.add('security-alert', {
      userId,
      type: 'security-password-changed',
    });

    return { success: true };
  },

  async setPassword(userId: string, newPassword: string) {
    const [credentialAccount] = await db
      .select({ id: account.id, password: account.password })
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential'),
        ),
      )
      .limit(1);

    if (credentialAccount?.password) {
      const err = new Error('Password already set — use "Change password" instead') as Error & { status: number };
      err.status = 409;
      throw err;
    }

    const hashedPassword = await hashPassword(newPassword);

    if (credentialAccount) {
      await db
        .update(account)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(account.id, credentialAccount.id));
    } else {
      await db.insert(account).values({
        id: crypto.randomUUID(),
        userId,
        accountId: userId,
        providerId: 'credential',
        password: hashedPassword,
      } as typeof account.$inferInsert);
    }

    return { success: true };
  },

  async disconnectGoogle(userId: string) {
    const accounts = await db
      .select({ providerId: account.providerId, password: account.password })
      .from(account)
      .where(eq(account.userId, userId));

    const hasCredential = accounts.some(
      (a) => a.providerId === 'credential' && a.password,
    );
    const hasGoogle = accounts.some((a) => a.providerId === 'google');

    if (!hasGoogle) {
      const err = new Error('Google account is not connected') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (!hasCredential) {
      const err = new Error('Set a password first to disconnect Google') as Error & { status: number };
      err.status = 409;
      throw err;
    }

    await db
      .delete(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'google'),
        ),
      );

    return { success: true };
  },

  async connectGoogle(_userId: string) {
    return { redirectUrl: '/api/auth/sign-in/social?provider=google&callbackURL=/settings' };
  },

  async deleteAccount(userId: string) {
    await db.transaction(async (tx) => {
      await tx.delete(session).where(eq(session.userId, userId));

      await tx
        .update(user)
        .set({ deletedAt: new Date() })
        .where(eq(user.id, userId));

      await tx
        .delete(tripMembers)
        .where(eq(tripMembers.userId, userId));

      await tx
        .update(messages)
        .set({ deletedAt: new Date() })
        .where(eq(messages.userId, userId));

      await tx
        .update(expenses)
        .set({ archivedAt: new Date() })
        .where(eq(expenses.createdByUserId, userId));

      await tx
        .update(tripDocuments)
        .set({ archivedAt: new Date() })
        .where(eq(tripDocuments.uploadedByUserId, userId));
    });

    return { success: true };
  },
};
