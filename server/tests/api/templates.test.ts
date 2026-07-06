import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, authCookie, cleanup } from '../setup.js';
import { db } from '../../src/common/db.js';
import { templates, templateDays, templateEvents } from '../../src/db/index.js';

let user: Awaited<ReturnType<typeof createTestUser>>;
let userToken: string;
let templateId: string;

beforeAll(async () => {
  await cleanup();
  
  user = await createTestUser({ name: 'Template User' });
  userToken = await createTestSession(user.id);

  // Seed a published template directly in the DB for testing
  const [tmpl] = await db
    .insert(templates)
    .values({
      title: 'Test Template',
      destination: 'Test City',
      description: 'A test template',
      visibility: 'published',
      categories: ['adventure'],
      createdByUserId: user.id,
    })
    .returning();
  templateId = tmpl.id;

  const [day] = await db
    .insert(templateDays)
    .values({ templateId, dayNumber: 1, order: 1 })
    .returning();

  await db.insert(templateEvents).values({
    dayId: day.id,
    title: 'Morning hike',
    order: 1,
  });
});

afterAll(async () => {
  await cleanup();
});

describe('Templates API Exhaustive Tests', () => {
  describe('GET /api/v1/templates', () => {
    it('lists published templates (200)', async () => {
      const res = await request().get('/api/v1/templates').set('Cookie', authCookie(userToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('supports search query (200)', async () => {
      const res = await request().get('/api/v1/templates?search=Test').set('Cookie', authCookie(userToken));
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('supports category filter (200)', async () => {
      const res = await request().get('/api/v1/templates?category=adventure').set('Cookie', authCookie(userToken));
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/v1/templates/:templateId', () => {
    it('returns template with days (200)', async () => {
      const res = await request().get(`/api/v1/templates/${templateId}`).set('Cookie', authCookie(userToken));
      expect(res.status).toBe(200);
      expect(res.body.data.days).toBeInstanceOf(Array);
    });

    it('returns 404 for invalid uuid', async () => {
      const res = await request().get(`/api/v1/templates/00000000-0000-0000-0000-000000000000`).set('Cookie', authCookie(userToken));
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/v1/templates/:templateId/clone', () => {
    it('clones a template into a new trip (201)', async () => {
      const res = await request()
        .post(`/api/v1/templates/${templateId}/clone`)
        .set('Cookie', authCookie(userToken))
        .set('Content-Type', 'application/json')
        .send({
          tripName: 'Cloned Trip',
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-01-07T00:00:00.000Z',
        });
      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('tripId');
    });

    it('rejects clone if missing both existingTripId and new trip details (422)', async () => {
      const res = await request()
        .post(`/api/v1/templates/${templateId}/clone`)
        .set('Cookie', authCookie(userToken))
        .set('Content-Type', 'application/json')
        .send({}); // missing everything
      expect(res.status).toBe(422);
    });

    it('rejects clone if unauthenticated (401)', async () => {
      const res = await request()
        .post(`/api/v1/templates/${templateId}/clone`)
        .set('Content-Type', 'application/json')
        .send({
          tripName: 'Hacker Trip',
          startDate: '2025-01-01T00:00:00.000Z',
          endDate: '2025-01-07T00:00:00.000Z',
        });
      expect(res.status).toBe(401);
    });
  });
});
