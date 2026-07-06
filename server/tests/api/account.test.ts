import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, authCookie, cleanup } from '../setup.js';

let user1: Awaited<ReturnType<typeof createTestUser>>;
let user1Token: string;

beforeAll(async () => {
  await cleanup();
  user1 = await createTestUser({ name: 'Account User', email: 'account@test.local' });
  user1Token = await createTestSession(user1.id);
});

afterAll(async () => { await cleanup(); });

describe('GET /api/v1/account/profile', () => {
  it('returns user profile', async () => {
    const res = await request().get('/api/v1/account/profile').set('Cookie', authCookie(user1Token));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('email');
    expect(res.body.data).toHaveProperty('name');
    expect(res.body.data.email).toBe('account@test.local');
  });
  it('rejects unauthenticated', async () => {
    const res = await request().get('/api/v1/account/profile');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/v1/account/profile', () => {
  it('updates name', async () => {
    const res = await request().patch('/api/v1/account/profile')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json')
      .send({ name: 'Updated Account User' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Account User');
  });
  it('rejects empty name', async () => {
    const res = await request().patch('/api/v1/account/profile')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json')
      .send({ name: '' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/account/profile/photo-url', () => {
  it('returns presigned upload URL', async () => {
    const res = await request().post('/api/v1/account/profile/photo-url')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json')
      .send({ fileType: 'image/jpeg', sizeBytes: 1000 });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('uploadUrl');
    expect(res.body.data).toHaveProperty('storageKey');
  });
});

describe('POST /api/v1/account/change-email (M1 fix)', () => {
  it('rejects without current password', async () => {
    const res = await request().post('/api/v1/account/change-email')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json')
      .send({ newEmail: 'new@test.local' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/account/change-password (C1 fix)', () => {
  it('rejects without body', async () => {
    const res = await request().post('/api/v1/account/change-password')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json')
      .send({});
    expect(res.status).toBe(422);
  });
});

describe('POST /api/v1/account/set-password', () => {
  it('rejects if user already has password', async () => {
    const res = await request().post('/api/v1/account/set-password')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json')
      .send({ newPassword: 'NewPass123!' });
    expect(res.status).toBe(422);
  });
});

describe('DELETE /api/v1/account', () => {
  it('rejects without confirmation string', async () => {
    const res = await request().delete('/api/v1/account')
      .set('Cookie', authCookie(user1Token)).set('Content-Type', 'application/json')
      .send({});
    expect(res.status).toBe(422);
  });
  it('soft-deletes with correct confirmation', async () => {
    const tempUser = await createTestUser({ name: 'DeleteMe' });
    const tempToken = await createTestSession(tempUser.id);
    const res = await request().delete('/api/v1/account')
      .set('Cookie', authCookie(tempToken)).set('Content-Type', 'application/json')
      .send({ confirmation: 'delete my account' });
    expect(res.status).toBe(200);
  });
});
