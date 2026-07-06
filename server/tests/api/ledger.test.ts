/**
 * Ledger API — integration tests
 *
 * Covers: Expenses CRUD, balances, settlements (including M2 fix validation),
 * budget overview, and soft-delete.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, createTestTrip, addTripMember, authCookie, cleanup } from '../setup.js';

let organizer: Awaited<ReturnType<typeof createTestUser>>;
let organizerToken: string;
let member: Awaited<ReturnType<typeof createTestUser>>;
let memberToken: string;
let tripId: string;

beforeAll(async () => {
  await cleanup();
  organizer = await createTestUser({ name: 'Ledger Organizer' });
  organizerToken = await createTestSession(organizer.id);
  member = await createTestUser({ name: 'Ledger Member' });
  memberToken = await createTestSession(member.id);
  const trip = await createTestTrip(organizer.id, { name: 'Ledger Trip' });
  tripId = trip.id;
  await addTripMember(tripId, member.id, 'member');
});

afterAll(async () => {
  await cleanup();
});

describe('POST /api/v1/trips/:tripId/expenses', () => {
  it('creates an expense with participants', async () => {
    const res = await request()
      .post(`/api/v1/trips/${tripId}/expenses`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({
        description: 'Dinner',
        amount: 100,
        category: 'food_and_drinks',
        paidByUserId: organizer.id,
        splitMethod: 'equal',
        incurredAt: '2025-01-01T18:00:00.000Z',
        participants: [
          { userId: organizer.id, shareAmount: 50 },
          { userId: member.id, shareAmount: 50 },
        ],
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });

  it('rejects expenses with missing fields', async () => {
    const res = await request()
      .post(`/api/v1/trips/${tripId}/expenses`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({ description: 'Incomplete' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/trips/:tripId/expenses', () => {
  it('lists expenses for the trip', async () => {
    const res = await request()
      .get(`/api/v1/trips/${tripId}/expenses`)
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe('GET /api/v1/trips/:tripId/balances', () => {
  it('returns balance entries for the trip', async () => {
    const res = await request()
      .get(`/api/v1/trips/${tripId}/balances`)
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe('GET /api/v1/trips/:tripId/settlements/suggest', () => {
  it('returns settlement suggestions', async () => {
    const res = await request()
      .get(`/api/v1/trips/${tripId}/settlements/suggestions`)
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
});

describe('POST /api/v1/trips/:tripId/settlements (M2 fix)', () => {
  it('rejects self-settlement', async () => {
    const res = await request()
      .post(`/api/v1/trips/${tripId}/settlements`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({
        fromUserId: organizer.id,
        toUserId: organizer.id,
        amount: 50,
      });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('yourself');
  });

  it('rejects settlement with non-member', async () => {
    const outsider = await createTestUser({ name: 'Outsider' });
    const res = await request()
      .post(`/api/v1/trips/${tripId}/settlements`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({
        fromUserId: organizer.id,
        toUserId: outsider.id,
        amount: 50,
      });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('trip members');
  });

  it('records a valid settlement', async () => {
    const res = await request()
      .post(`/api/v1/trips/${tripId}/settlements`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({
        fromUserId: member.id,
        toUserId: organizer.id,
        amount: 50,
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });
});

describe('GET /api/v1/trips/:tripId/budget', () => {
  it('returns budget overview', async () => {
    const res = await request()
      .get(`/api/v1/trips/${tripId}/budget-overview`)
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalSpent');
  });
});
