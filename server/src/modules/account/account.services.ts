import { db } from '../../common/db.js';
import { getPresignedPutUrl } from '../../common/storage.js';
import { emailQueue } from '../../common/queues.js';
import { user, session, account, tripMembers } from '../../db/index.js';
import { eq, and, count } from 'drizzle-orm';

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
  const existing = await db.query.user.findFirst({
    where: eq(user.email, data.newEmail),
    columns: { id: true },
  });

  if (existing) {
    const err = new Error('Email already in use') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  await emailQueue.add('email-change', {
    to: data.newEmail,
    userId,
    type: 'email-change',
  });
}

export async function changeUserPassword(
  userId: string,
  data: { currentPassword: string; newPassword: string },
) {
  await emailQueue.add('security-alert', {
    userId,
    type: 'security-alert',
    action: 'password_changed',
  });

  await db.delete(session).where(and(eq(session.userId, userId)));
}

export async function setUserPassword(userId: string, data: { newPassword: string }) {
  await emailQueue.add('security-alert', {
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
