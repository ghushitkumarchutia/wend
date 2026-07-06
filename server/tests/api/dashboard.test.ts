import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, authCookie, cleanup } from '../setup.js';

let user: Awaited<ReturnType<typeof createTestUser>>;
let userToken: string;
let outsider: Awaited<ReturnType<typeof createTestUser>>;
let outsiderToken: string;

beforeAll(async () => {
  await cleanup();
  
  user = await createTestUser({ name: 'Dashboard User' });
  userToken = await createTestSession(user.id);
  
  outsider = await createTestUser({ name: 'Outsider' });
  outsiderToken = await createTestSession(outsider.id);
});

afterAll(async () => {
  await cleanup();
});

describe('Dashboard API Exhaustive Tests', () => {
  describe('GET /api/v1/dashboard/stats', () => {
    it('returns stats for authenticated user (200)', async () => {
      const res = await request()
        .get('/api/v1/dashboard/stats')
        .set('Cookie', authCookie(userToken));
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('upcomingTrips');
      expect(res.body.data).toHaveProperty('ongoingTrips');
      expect(res.body.data).toHaveProperty('completedTrips');
      expect(res.body.data).toHaveProperty('pendingInvites');
    });

    it('rejects unauthenticated access (401)', async () => {
      const res = await request()
        .get('/api/v1/dashboard/stats');
      expect(res.status).toBe(401);
    });
  });
});
