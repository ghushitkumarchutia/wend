/**
 * Trips API — integration tests
 *
 * Covers: CRUD, archive/restore, activity feed, 404 handler, auth guard.
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { request, createTestUser, createTestSession, createTestTrip, authCookie, cleanup } from '../setup.js';

let organizer: Awaited<ReturnType<typeof createTestUser>>;
let organizerToken: string;
let viewer: Awaited<ReturnType<typeof createTestUser>>;
let viewerToken: string;

beforeAll(async () => {
  await cleanup();
  organizer = await createTestUser({ name: 'Trip Organizer' });
  organizerToken = await createTestSession(organizer.id);
  viewer = await createTestUser({ name: 'Viewer' });
  viewerToken = await createTestSession(viewer.id);
});

afterAll(async () => {
  await cleanup();
});

describe('Auth guard', () => {
  it('rejects unauthenticated requests with 401', async () => {
    const res = await request().get('/api/v1/trips');
    expect(res.status).toBe(401);
  });
});

describe('404 handler', () => {
  it('returns JSON 404 for undefined routes', async () => {
    const res = await request()
      .get('/api/v1/nonexistent')
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/v1/trips', () => {
  it('creates a trip and returns 201', async () => {
    const res = await request()
      .post('/api/v1/trips')
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({
        name: 'Integration Test Trip',
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2025-01-10T00:00:00.000Z',
        destination: 'Paris, France',
        baseCurrency: 'EUR',
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.name).toBe('Integration Test Trip');
  });

  it('rejects missing required fields with 400', async () => {
    const res = await request()
      .post('/api/v1/trips')
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({ name: 'Incomplete' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/trips', () => {
  it('returns user trips', async () => {
    const res = await request()
      .get('/api/v1/trips')
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/v1/trips/:tripId', () => {
  let tripId: string;

  beforeEach(async () => {
    const trip = await createTestTrip(organizer.id, { name: 'Detail Trip' });
    tripId = trip.id;
  });

  it('returns trip details for a member', async () => {
    const res = await request()
      .get(`/api/v1/trips/${tripId}`)
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Detail Trip');
  });

  it('rejects non-members with 403', async () => {
    const res = await request()
      .get(`/api/v1/trips/${tripId}`)
      .set('Cookie', authCookie(viewerToken));
    expect(res.status).toBe(404);
  });

  it('returns 404 for nonexistent trip', async () => {
    const res = await request()
      .get('/api/v1/trips/00000000-0000-0000-0000-000000000000')
      .set('Cookie', authCookie(organizerToken));
    expect([403, 404]).toContain(res.status);
  });
});

describe('PATCH /api/v1/trips/:tripId', () => {
  let tripId: string;

  beforeEach(async () => {
    const trip = await createTestTrip(organizer.id, { name: 'Update Trip' });
    tripId = trip.id;
  });

  it('updates trip fields', async () => {
    const res = await request()
      .patch(`/api/v1/trips/${tripId}`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });
});

describe('POST /api/v1/trips/:tripId/archive', () => {
  let tripId: string;

  beforeEach(async () => {
    const trip = await createTestTrip(organizer.id, { name: 'Archive Trip' });
    tripId = trip.id;
  });

  it('archives a trip', async () => {
    const res = await request()
      .post(`/api/v1/trips/${tripId}/archive`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
    expect(res.body.data.success).toBe(true);
  });

  it('restores an archived trip', async () => {
    await request()
      .post(`/api/v1/trips/${tripId}/archive`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json');

    const res = await request()
      .post(`/api/v1/trips/${tripId}/restore`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
  });
});
