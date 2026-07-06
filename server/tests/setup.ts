/**
 * Test setup — provides helper utilities for integration tests.
 */

import { app } from '../src/app.js';
import { db } from '../src/common/db.js';
import { user, session, account, trips, tripMembers } from '../src/db/index.js';
import { eq, sql } from 'drizzle-orm';
import { randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { vi } from 'vitest';

// MOCK getIO to prevent errors during tests
vi.mock('../src/common/socket.js', () => ({
  getIO: () => ({
    to: () => ({ emit: () => {} }),
    emit: () => {},
  }),
  initSocketServer: () => {},
}));

import supertest from 'supertest';
import { auth } from '../src/common/auth.js';

// MOCK better-auth session retrieval for testing
auth.api.getSession = async (opts: any) => {
  const cookie = opts?.headers?.get('cookie') || '';
  const tokenMatch = cookie.match(/better-auth\.session_token=([^;]+)/);
  if (tokenMatch) {
    const token = tokenMatch[1];
    const [sess] = await db.select().from(session).where(eq(session.token, token));
    if (sess) {
      const [u] = await db.select().from(user).where(eq(user.id, sess.userId));
      return { session: sess, user: u };
    }
  }
  return null as any;
};

const scryptAsync = promisify(scrypt);

export const testApp = app;
export const request = () => supertest(app);

let userCounter = 0;

export async function createTestUser(
  overrides: { name?: string; email?: string; password?: string } = {},
) {
  userCounter++;
  const id = crypto.randomUUID();
  const name = overrides.name ?? `Test User ${userCounter}`;
  const email = overrides.email ?? `testuser-${userCounter}-${Date.now()}@test.local`;
  const rawPassword = overrides.password ?? 'TestPassword123!';

  const [newUser] = await db
    .insert(user)
    .values({
      id,
      name,
      email,
      emailVerified: true,
    })
    .returning();

  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(rawPassword, salt, 64)) as Buffer;
  const passwordHash = `${salt}:${hash.toString('hex')}`;

  await db.insert(account).values({
    id: crypto.randomUUID(),
    userId: newUser.id,
    providerId: 'credential',
    accountId: newUser.id,
    password: passwordHash,
  });

  return { id: newUser.id, email, password: rawPassword, name };
}

export async function createTestSession(userId: string): Promise<string> {
  const id = crypto.randomUUID();
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(session).values({
    id,
    userId,
    token,
    expiresAt,
  });

  return token;
}

export function authCookie(token: string): string {
  return `better-auth.session_token=${token}`;
}

export async function createTestTrip(
  userId: string,
  overrides: { name?: string; destination?: string } = {},
) {
  const [trip] = await db
    .insert(trips)
    .values({
      name: overrides.name ?? 'Test Trip',
      destination: overrides.destination ?? 'Test City',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      baseCurrency: 'USD',
      createdByUserId: userId,
    })
    .returning();

  await db.insert(tripMembers).values({
    tripId: trip.id,
    userId,
    role: 'organizer',
  });

  return trip;
}

export async function addTripMember(
  tripId: string,
  userId: string,
  role: 'organizer' | 'member' | 'viewer' = 'member',
) {
  await db.insert(tripMembers).values({ tripId, userId, role });
}

const CLEANUP_TABLES = [
  'template_audit_log',
  'template_events',
  'template_days',
  'templates',
  'poll_votes',
  'poll_options',
  'polls',
  'messages',
  'trip_documents',
  'settlements',
  'expense_participants',
  'expenses',
  'itinerary_flight_details',
  'itinerary_events',
  'trip_invites',
  'trip_members',
  'activity_log',
  'notification_preferences',
  'notifications',
  'trips',
  'session',
  'account',
  'verification',
  'jwks',
  '"user"',
];

export async function cleanup() {
  for (const table of CLEANUP_TABLES) {
    try {
      await db.execute(sql.raw(`TRUNCATE TABLE ${table} CASCADE`));
    } catch {
      /* Table may not exist */
    }
  }
}
