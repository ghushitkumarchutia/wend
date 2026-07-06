import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, authCookie, cleanup } from '../setup.js';
import { db } from '../../src/common/db.js';
import { user } from '../../src/db/index.js';
import { eq } from 'drizzle-orm';

let adminUser: Awaited<ReturnType<typeof createTestUser>>;
let adminToken: string;
let normalUser: Awaited<ReturnType<typeof createTestUser>>;
let normalToken: string;

beforeAll(async () => {
  await cleanup();
  adminUser = await createTestUser({ name: 'Admin User' });
  // Set admin role on user
  await db.update(user).set({ role: 'admin' } as any).where(eq(user.id, adminUser.id));
  adminToken = await createTestSession(adminUser.id);
  normalUser = await createTestUser({ name: 'Normal User' });
  normalToken = await createTestSession(normalUser.id);
});

afterAll(async () => { await cleanup(); });

describe('Admin auth guard', () => {
  it('rejects non-admin users', async () => {
    const res = await request().get('/api/admin/templates').set('Cookie', authCookie(normalToken));
    expect(res.status).toBe(403);
  });
});

describe('POST /api/admin/templates', () => {
  it('creates a template', async () => {
    const res = await request().post('/api/admin/templates')
      .set('Cookie', authCookie(adminToken)).set('Content-Type', 'application/json')
      .send({
        title: 'Admin Template',
        destination: 'Tokyo',
        description: 'A test template',
        categories: ['culture'],
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });
});

describe('GET /api/admin/templates', () => {
  it('lists all templates', async () => {
    const res = await request().get('/api/admin/templates').set('Cookie', authCookie(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('GET /api/admin/templates/stats', () => {
  it('returns stats', async () => {
    const res = await request().get('/api/admin/templates/stats').set('Cookie', authCookie(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('total');
    expect(res.body.data).toHaveProperty('published');
  });
});

describe('PATCH /api/admin/templates/:id', () => {
  it('updates a template', async () => {
    const listRes = await request().get('/api/admin/templates').set('Cookie', authCookie(adminToken));
    const templateId = listRes.body.data[0].id;
    const res = await request().patch(`/api/admin/templates/${templateId}`)
      .set('Cookie', authCookie(adminToken)).set('Content-Type', 'application/json')
      .send({ title: 'Updated Template' });
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Updated Template');
  });
});

describe('PATCH /api/admin/templates/:id/visibility', () => {
  it('changes visibility', async () => {
    const listRes = await request().get('/api/admin/templates').set('Cookie', authCookie(adminToken));
    const templateId = listRes.body.data[0].id;
    const res = await request().patch(`/api/admin/templates/${templateId}/visibility`)
      .set('Cookie', authCookie(adminToken)).set('Content-Type', 'application/json')
      .send({ visibility: 'published' });
    expect(res.status).toBe(200);
  });
});

describe('POST /api/admin/templates/:id/days', () => {
  it('adds a day', async () => {
    const listRes = await request().get('/api/admin/templates').set('Cookie', authCookie(adminToken));
    const templateId = listRes.body.data[0].id;
    const res = await request().post(`/api/admin/templates/${templateId}/days`)
      .set('Cookie', authCookie(adminToken)).set('Content-Type', 'application/json')
      .send({ dayNumber: 1 });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });
});

describe('POST /api/admin/templates/:id/days/:dayId/events', () => {
  it('adds an event to a day', async () => {
    const listRes = await request().get('/api/admin/templates').set('Cookie', authCookie(adminToken));
    const templateId = listRes.body.data[0].id;
    const detailRes = await request().get(`/api/admin/templates/${templateId}`).set('Cookie', authCookie(adminToken));
    const dayId = detailRes.body.data.days[0].id;
    const res = await request().post(`/api/admin/templates/${templateId}/days/${dayId}/events`)
      .set('Cookie', authCookie(adminToken)).set('Content-Type', 'application/json')
      .send({ title: 'Temple visit', order: 1 });
    expect(res.status).toBe(201);
  });
});

describe('POST /api/admin/templates/:id/duplicate', () => {
  it('duplicates a template', async () => {
    const listRes = await request().get('/api/admin/templates').set('Cookie', authCookie(adminToken));
    const templateId = listRes.body.data[0].id;
    const res = await request().post(`/api/admin/templates/${templateId}/duplicate`)
      .set('Cookie', authCookie(adminToken)).set('Content-Type', 'application/json');
    expect(res.status).toBe(201);
    expect(res.body.data.title).toContain('(Copy)');
  });
});

describe('DELETE /api/admin/templates/:id (C2 fix)', () => {
  it('deletes a template without FK violation', async () => {
    // Create a fresh template to delete
    const createRes = await request().post('/api/admin/templates')
      .set('Cookie', authCookie(adminToken)).set('Content-Type', 'application/json')
      .send({ title: 'New Template', destination: 'Paris', description: 'Test', categories: ['test'] });
    const templateId = createRes.body.data.id;
    const res = await request().delete(`/api/admin/templates/${templateId}`)
      .set('Cookie', authCookie(adminToken));
    expect(res.status).toBe(204);
  });
});
