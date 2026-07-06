import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, createTestTrip, addTripMember, authCookie, cleanup } from '../setup.js';
import { db } from '../../src/common/db.js';
import { notifications } from '../../src/db/index.js';

let user1: Awaited<ReturnType<typeof createTestUser>>;
let user1Token: string;

beforeAll(async () => {
  await cleanup();
  user1 = await createTestUser({ name: 'Notif User' });
  user1Token = await createTestSession(user1.id);
  const trip = await createTestTrip(user1.id, { name: 'Notif Trip' });
  // Seed a notification
  await db.insert(notifications).values({
    userId: user1.id,
    type: 'expense_added',
    tripId: trip.id,
    tripName: 'Notif Trip',
    actorName: 'Test Actor',
    status: 'unread',
  });
});

afterAll(async () => { await cleanup(); });

describe('GET /api/v1/notifications', () => {
  it('returns notifications list', async () => {
    const res = await request().get('/api/v1/notifications').set('Cookie', authCookie(user1Token));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
  it('rejects unauthenticated', async () => {
    const res = await request().get('/api/v1/notifications');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/v1/notifications/:id/read', () => {
  it('marks notification as read', async () => {
    const listRes = await request().get('/api/v1/notifications').set('Cookie', authCookie(user1Token));
    const notifId = listRes.body.data[0].id;
    const res = await request().patch(`/api/v1/notifications/${notifId}/read`)
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
  });
});

describe('POST /api/v1/notifications/mark-all-read', () => {
  it('marks all as read', async () => {
    const res = await request().post('/api/v1/notifications/mark-all-read')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/v1/notifications/:id/archive', () => {
  it('archives a notification', async () => {
    const listRes = await request().get('/api/v1/notifications').set('Cookie', authCookie(user1Token));
    if (listRes.body.data.length > 0) {
      const notifId = listRes.body.data[0].id;
      const res = await request().patch(`/api/v1/notifications/${notifId}/archive`)
        .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json');
      expect(res.status).toBe(200);
    }
  });
});

describe('GET /api/v1/notifications/preferences', () => {
  it('returns preferences', async () => {
    const res = await request().get('/api/v1/notifications/preferences').set('Cookie', authCookie(user1Token));
    expect(res.status).toBe(200);
  });
});

describe('PUT /api/v1/notifications/preferences', () => {
  it('updates preferences', async () => {
    const res = await request().put('/api/v1/notifications/preferences')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json')
      .send({ preferences: [{ type: 'expense_added', inApp: true, email: false }] });
    expect(res.status).toBe(200);
  });
});
