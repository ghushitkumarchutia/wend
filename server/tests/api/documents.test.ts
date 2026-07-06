import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, createTestTrip, addTripMember, authCookie, cleanup } from '../setup.js';

let organizer: Awaited<ReturnType<typeof createTestUser>>;
let organizerToken: string;
let member: Awaited<ReturnType<typeof createTestUser>>;
let memberToken: string;
let tripId: string;

beforeAll(async () => {
  await cleanup();
  organizer = await createTestUser({ name: 'Doc Organizer' });
  organizerToken = await createTestSession(organizer.id);
  member = await createTestUser({ name: 'Doc Member' });
  memberToken = await createTestSession(member.id);
  const trip = await createTestTrip(organizer.id, { name: 'Doc Trip' });
  tripId = trip.id;
  await addTripMember(tripId, member.id, 'member');
});

afterAll(async () => { await cleanup(); });

describe('GET /:tripId/documents', () => {
  it('returns empty list initially', async () => {
    const res = await request().get(`/api/v1/trips/${tripId}/documents`).set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
  });
  it('rejects non-member', async () => {
    const outsider = await createTestUser();
    const outsiderToken = await createTestSession(outsider.id);
    const res = await request().get(`/api/v1/trips/${tripId}/documents`).set('Cookie', authCookie(outsiderToken));
    expect(res.status).toBe(404);
  });
});

describe('POST /:tripId/documents/upload-url', () => {
  it('returns presigned upload URL', async () => {
    const res = await request().post(`/api/v1/trips/${tripId}/documents/upload-url`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({ fileType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('uploadUrl');
    expect(res.body.data).toHaveProperty('storageKey');
  });
});

describe('POST /:tripId/documents/confirm', () => {
  it('confirms an upload and creates document record', async () => {
    const urlRes = await request().post(`/api/v1/trips/${tripId}/documents/upload-url`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({ fileType: 'application/pdf' });
    const res = await request().post(`/api/v1/trips/${tripId}/documents/confirm`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({
        storageKey: urlRes.body.data.storageKey,
        fileName: 'boarding.pdf',
        fileType: 'application/pdf',
        sizeBytes: 12345,
        visibility: 'shared',
      });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });
});

describe('DELETE /:tripId/documents/:docId (L3 fix — ownership check)', () => {
  let docId: string;
  beforeAll(async () => {
    const urlRes = await request().post(`/api/v1/trips/${tripId}/documents/upload-url`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({ fileType: 'application/pdf' });
    const confirmRes = await request().post(`/api/v1/trips/${tripId}/documents/confirm`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({
        storageKey: urlRes.body.data.storageKey,
        fileName: 'delete-test.pdf', sizeBytes: 100,
        fileType: 'application/pdf', visibility: 'shared',
      });
    docId = confirmRes.body.data.id;
  });

  it('non-uploader member cannot delete (L3 fix)', async () => {
    const res = await request().delete(`/api/v1/trips/${tripId}/documents/${docId}`)
      .set('Cookie', authCookie(memberToken));
    expect(res.status).toBe(403);
  });

  it('uploader can delete', async () => {
    const res = await request().delete(`/api/v1/trips/${tripId}/documents/${docId}`)
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
  });
});
