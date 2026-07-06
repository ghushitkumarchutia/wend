import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, createTestTrip, addTripMember, authCookie, cleanup } from '../setup.js';

let organizer: Awaited<ReturnType<typeof createTestUser>>;
let organizerToken: string;
let member: Awaited<ReturnType<typeof createTestUser>>;
let memberToken: string;
let viewer: Awaited<ReturnType<typeof createTestUser>>;
let viewerToken: string;
let outsider: Awaited<ReturnType<typeof createTestUser>>;
let outsiderToken: string;

let tripId: string;
let eventId: string;

beforeAll(async () => {
  await cleanup();
  
  organizer = await createTestUser({ name: 'Organizer' });
  organizerToken = await createTestSession(organizer.id);
  
  member = await createTestUser({ name: 'Member' });
  memberToken = await createTestSession(member.id);
  
  viewer = await createTestUser({ name: 'Viewer' });
  viewerToken = await createTestSession(viewer.id);
  
  outsider = await createTestUser({ name: 'Outsider' });
  outsiderToken = await createTestSession(outsider.id);

  const trip = await createTestTrip(organizer.id, { name: 'Itinerary Trip' });
  tripId = trip.id;
  await addTripMember(tripId, member.id, 'member');
  await addTripMember(tripId, viewer.id, 'viewer');
});

afterAll(async () => {
  await cleanup();
});

describe('Itinerary API Exhaustive Tests', () => {
  describe('POST /api/v1/trips/:tripId/itinerary', () => {
    it('creates an event successfully (member)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/itinerary`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({
          title: 'Dinner at Paris',
          category: 'restaurant',
          startAt: '2025-01-01T18:00:00.000Z',
          endAt: '2025-01-01T20:00:00.000Z',
        });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      eventId = res.body.data.id;
    });

    it('rejects creation for viewer role (403)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/itinerary`)
        .set('Cookie', authCookie(viewerToken))
        .set('Content-Type', 'application/json')
        .send({
          title: 'Viewer Event',
          category: 'activity',
          startAt: '2025-01-02T10:00:00.000Z',
        });
      expect(res.status).toBe(403);
    });

    it('rejects creation for outsider (404)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/itinerary`)
        .set('Cookie', authCookie(outsiderToken))
        .set('Content-Type', 'application/json')
        .send({
          title: 'Outsider Event',
          category: 'activity',
          startAt: '2025-01-02T10:00:00.000Z',
        });
      expect(res.status).toBe(404);
    });

    it('rejects invalid payload format (422)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/itinerary`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({
          title: 'Missing Date and Category',
        });
      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects invalid date format (422)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/itinerary`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({
          title: 'Bad Date',
          category: 'food',
          startAt: '2025-01-01', // not ISO string
        });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/trips/:tripId/itinerary', () => {
    it('returns event list for viewer (200)', async () => {
      const res = await request()
        .get(`/api/v1/trips/${tripId}/itinerary`)
        .set('Cookie', authCookie(viewerToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('rejects event list for outsider (404)', async () => {
      const res = await request()
        .get(`/api/v1/trips/${tripId}/itinerary`)
        .set('Cookie', authCookie(outsiderToken));
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/v1/trips/:tripId/itinerary/:eventId', () => {
    it('returns specific event details (200)', async () => {
      const res = await request()
        .get(`/api/v1/trips/${tripId}/itinerary/${eventId}`)
        .set('Cookie', authCookie(viewerToken));
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Dinner at Paris');
    });
  });

  describe('PATCH /api/v1/trips/:tripId/itinerary/:eventId', () => {
    it('updates an event successfully (member)', async () => {
      const res = await request()
        .patch(`/api/v1/trips/${tripId}/itinerary/${eventId}`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({ title: 'Dinner at Rome', version: 1 });
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Dinner at Rome');
    });

    it('rejects updates for viewer role (403)', async () => {
      const res = await request()
        .patch(`/api/v1/trips/${tripId}/itinerary/${eventId}`)
        .set('Cookie', authCookie(viewerToken))
        .set('Content-Type', 'application/json')
        .send({ title: 'Hacked', version: 1 });
      expect(res.status).toBe(403);
    });
    
    it('rejects bad update payload (422)', async () => {
      const res = await request()
        .patch(`/api/v1/trips/${tripId}/itinerary/${eventId}`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({ startAt: '2025' }); // Bad date
      expect(res.status).toBe(422);
    });
  });

describe('PATCH /api/v1/trips/:tripId/itinerary/reorder', () => {
    it('reorders events successfully (member)', async () => {
      const res = await request()
        .patch(`/api/v1/trips/${tripId}/itinerary/reorder`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({
          events: [
            { id: eventId, order: 10 }
          ]
        });
      expect(res.status).toBe(200);
    });

    it('rejects reorder for viewer role (403)', async () => {
      const res = await request()
        .patch(`/api/v1/trips/${tripId}/itinerary/reorder`)
        .set('Cookie', authCookie(viewerToken))
        .set('Content-Type', 'application/json')
        .send({
          events: [
            { id: eventId, order: 10 }
          ]
        });
      expect(res.status).toBe(403);
    });
  });

  describe('DELETE /api/v1/trips/:tripId/itinerary/:eventId', () => {
    it('rejects delete for viewer role (403)', async () => {
      const res = await request()
        .delete(`/api/v1/trips/${tripId}/itinerary/${eventId}`)
        .set('Cookie', authCookie(viewerToken));
      expect(res.status).toBe(403);
    });

    it('deletes an event successfully (member)', async () => {
      const res = await request()
        .delete(`/api/v1/trips/${tripId}/itinerary/${eventId}`)
        .set('Cookie', authCookie(memberToken));
      expect(res.status).toBe(204);
    });
  });
});
