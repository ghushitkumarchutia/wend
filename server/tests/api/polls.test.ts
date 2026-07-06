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
let pollId: string;
let optionId: string;

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

  const trip = await createTestTrip(organizer.id, { name: 'Polls Trip' });
  tripId = trip.id;
  await addTripMember(tripId, member.id, 'member');
  await addTripMember(tripId, viewer.id, 'viewer');
});

afterAll(async () => {
  await cleanup();
});

describe('Polls API Exhaustive Tests', () => {
  describe('POST /api/v1/trips/:tripId/polls', () => {
    it('creates a poll successfully (member)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/polls`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({
          question: 'Where to eat?',
          options: ['Pizza', 'Sushi', 'Tacos'],
        });
      if (res.status === 500) {
        console.error('500 ERROR:', JSON.stringify(res.body, null, 2));
      }
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('id');
      pollId = res.body.data.id;
    });

    it('rejects creation for viewer role (403)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/polls`)
        .set('Cookie', authCookie(viewerToken))
        .set('Content-Type', 'application/json')
        .send({
          question: 'Viewer Poll?',
          options: ['Yes', 'No'],
        });
      expect(res.status).toBe(403);
    });

    it('rejects creation for outsider (404)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/polls`)
        .set('Cookie', authCookie(outsiderToken))
        .set('Content-Type', 'application/json')
        .send({
          question: 'Outsider Poll?',
          options: ['Yes', 'No'],
        });
      expect(res.status).toBe(404);
    });

    it('rejects duplicate options (422)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/polls`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({
          question: 'Duplicate options?',
          options: ['Pizza', 'Pizza'],
        });
      expect(res.status).toBe(422);
    });
    
    it('rejects less than 2 options (422)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/polls`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({
          question: 'One option?',
          options: ['Only Me'],
        });
      expect(res.status).toBe(422);
    });
  });

  describe('GET /api/v1/trips/:tripId/polls', () => {
    it('returns poll list for viewer (200)', async () => {
      const res = await request()
        .get(`/api/v1/trips/${tripId}/polls`)
        .set('Cookie', authCookie(viewerToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      
      const poll = res.body.data.find((p: any) => p.id === pollId);
      optionId = poll.options[0].id; // save for voting test
    });

    it('rejects poll list for outsider (404)', async () => {
      const res = await request()
        .get(`/api/v1/trips/${tripId}/polls`)
        .set('Cookie', authCookie(outsiderToken));
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/trips/:tripId/polls/:pollId/votes', () => {
    it('casts a vote successfully (member)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/polls/${pollId}/votes`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({ optionId });
      expect(res.status).toBe(200);
    });

    it('rejects vote from viewer (403)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/polls/${pollId}/votes`)
        .set('Cookie', authCookie(viewerToken))
        .set('Content-Type', 'application/json')
        .send({ optionId });
      expect(res.status).toBe(403);
    });

    it('rejects invalid optionId payload (422)', async () => {
      const res = await request()
        .post(`/api/v1/trips/${tripId}/polls/${pollId}/votes`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json')
        .send({ optionId: 'not-a-uuid' });
      expect(res.status).toBe(422);
    });
  });

  describe('PATCH /api/v1/trips/:tripId/polls/:pollId/close', () => {
    it('rejects closing poll by member (403)', async () => {
      const res = await request()
        .patch(`/api/v1/trips/${tripId}/polls/${pollId}/close`)
        .set('Cookie', authCookie(memberToken))
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(403); // organizer only
    });

    it('closes poll successfully (organizer)', async () => {
      const res = await request()
        .patch(`/api/v1/trips/${tripId}/polls/${pollId}/close`)
        .set('Cookie', authCookie(organizerToken))
        .set('Content-Type', 'application/json');
      expect(res.status).toBe(200);
    });
  });
});
