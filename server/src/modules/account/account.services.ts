import { db } from '../../common/db.js';
import { auth } from '../../common/auth.js';
import { getPresignedPutUrl } from '../../common/storage.js';
import { emailQueue } from '../../common/queues.js';
import { user, session, account, tripMembers } from '../../db/index.js';
import { eq, and, count, isNull } from 'drizzle-orm';
import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { IncomingHttpHeaders } from 'node:http';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function verifyPassword(storedHash: string, password: string): Promise<boolean> {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) return false;
  const hashBuffer = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedBuffer = Buffer.from(hash, 'hex');
  return timingSafeEqual(hashBuffer, storedBuffer);
}

export async function getUserProfile(userId: string) {
  const row = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!row) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const [tripCount] = await db
    .select({ value: count() })
    .from(tripMembers)
    .where(eq(tripMembers.userId, userId));

  const hasPassword = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, 'credential')),
    columns: { id: true },
  });

  const hasGoogle = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, 'google')),
    columns: { id: true },
  });

  return {
    ...row,
    tripCount: tripCount?.value ?? 0,
    hasPassword: !!hasPassword,
    hasGoogle: !!hasGoogle,
  };
}

export async function updateUserProfile(userId: string, data: { name: string }) {
  const [updated] = await db
    .update(user)
    .set({ name: data.name, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning({ id: user.id, name: user.name });

  if (!updated) {
    const err = new Error('User not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return updated;
}

export async function getAvatarUploadUrl(userId: string, fileType: string) {
  const key = `avatars/${userId}/${Date.now()}`;
  const uploadUrl = await getPresignedPutUrl(key, fileType);
  return { uploadUrl, storageKey: key };
}

export async function confirmAvatarUpload(userId: string, storageKey: string) {
  await db
    .update(user)
    .set({ image: storageKey, updatedAt: new Date() })
    .where(eq(user.id, userId));
}

export async function changeUserEmail(
  userId: string,
  data: { newEmail: string; currentPassword: string },
) {
  const credentialAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, 'credential')),
    columns: { password: true },
  });

  if (!credentialAccount?.password) {
    const err = new Error('No password set — cannot verify identity') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const valid = await verifyPassword(credentialAccount.password, data.currentPassword);
  if (!valid) {
    const err = new Error('Current password is incorrect') as Error & { status: number };
    err.status = 403;
    throw err;
  }

  const existing = await db.query.user.findFirst({
    where: and(eq(user.email, data.newEmail), isNull(user.deletedAt)),
    columns: { id: true },
  });

  if (existing) {
    const err = new Error('Email already in use') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  await db
    .update(user)
    .set({ email: data.newEmail, emailVerified: false, updatedAt: new Date() })
    .where(eq(user.id, userId));

  await emailQueue.add('email-change', {
    to: data.newEmail,
    userName:
      (await db.query.user.findFirst({ where: eq(user.id, userId), columns: { name: true } }))
        ?.name ?? 'User',
    userId,
    type: 'email-change',
  });
}

export async function changeUserPassword(
  userId: string,
  data: { currentPassword: string; newPassword: string },
  headers: IncomingHttpHeaders,
) {
  try {
    await auth.api.changePassword({
      body: {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        revokeOtherSessions: true,
      },
      headers: headers as unknown as Headers,
    });
  } catch (error: unknown) {
    const err = new Error(
      error instanceof Error ? error.message : 'Password change failed',
    ) as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const userRow = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { email: true, name: true },
  });

  await emailQueue.add('security-alert', {
    to: userRow?.email ?? '',
    userName: userRow?.name ?? 'User',
    userId,
    type: 'security-alert',
    action: 'password_changed',
  });
}

export async function setUserPassword(userId: string, data: { newPassword: string }) {
  const credentialAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, 'credential')),
    columns: { id: true, password: true },
  });

  const newHash = await hashPassword(data.newPassword);

  if (credentialAccount) {
    await db
      .update(account)
      .set({ password: newHash, updatedAt: new Date() })
      .where(eq(account.id, credentialAccount.id));
  } else {
    await db.insert(account).values({
      id: crypto.randomUUID(),
      userId,
      providerId: 'credential',
      accountId: userId,
      password: newHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  const userRow = await db.query.user.findFirst({
    where: eq(user.id, userId),
    columns: { email: true, name: true },
  });

  await emailQueue.add('security-alert', {
    to: userRow?.email ?? '',
    userName: userRow?.name ?? 'User',
    userId,
    type: 'security-alert',
    action: 'password_set',
  });
}

export async function disconnectGoogleAccount(userId: string) {
  const credentialAccount = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, 'credential')),
    columns: { id: true },
  });

  if (!credentialAccount) {
    const err = new Error(
      'Cannot disconnect Google — no password set. Set a password first.',
    ) as Error & { status: number };
    err.status = 400;
    throw err;
  }

  await db.delete(account).where(and(eq(account.userId, userId), eq(account.providerId, 'google')));
}

export async function connectGoogleAccount(
  userId: string,
  data: { accountId: string; accessToken?: string; refreshToken?: string },
) {
  const existing = await db.query.account.findFirst({
    where: and(eq(account.userId, userId), eq(account.providerId, 'google')),
    columns: { id: true },
  });

  if (existing) {
    const err = new Error('Google account already connected') as Error & {
      status: number;
    };
    err.status = 409;
    throw err;
  }

  await db.insert(account).values({
    id: crypto.randomUUID(),
    userId,
    providerId: 'google',
    accountId: data.accountId,
    accessToken: data.accessToken ?? null,
    refreshToken: data.refreshToken ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function softDeleteAccount(userId: string) {
  await db
    .update(user)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(user.id, userId));

  await db.delete(session).where(eq(session.userId, userId));
}
