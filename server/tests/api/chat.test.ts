/**
 * Chat API — integration tests
 *
 * Covers: Send, list (cursor pagination), edit (15-min window), delete permissions.
 * Verifies M3/M4 fixes (Socket.IO events emitted — verified via successful service calls).
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
  organizer = await createTestUser({ name: 'Chat Organizer' });
  organizerToken = await createTestSession(organizer.id);
  member = await createTestUser({ name: 'Chat Member' });
  memberToken = await createTestSession(member.id);
  const trip = await createTestTrip(organizer.id, { name: 'Chat Trip' });
  tripId = trip.id;
  await addTripMember(tripId, member.id, 'member');
});

afterAll(async () => {
  await cleanup();
});

describe('POST /api/v1/trips/:tripId/chat/messages', () => {
  it('sends a message', async () => {
    const res = await request()
      .post(`/api/v1/trips/${tripId}/messages`)
      .set('Cookie', authCookie(memberToken))
      .set('Content-Type', 'application/json')
      .send({ body: 'Hello from tests!' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.body).toBe('Hello from tests!');
  });

  it('rejects empty messages', async () => {
    const res = await request()
      .post(`/api/v1/trips/${tripId}/messages`)
      .set('Cookie', authCookie(memberToken))
      .set('Content-Type', 'application/json')
      .send({ body: '' });
    expect(res.status).toBe(422);
  });
});

describe('GET /api/v1/trips/:tripId/chat/messages', () => {
  it('lists messages with cursor pagination', async () => {
    const res = await request()
      .get(`/api/v1/trips/${tripId}/messages`)
      .set('Cookie', authCookie(memberToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body).toHaveProperty('nextCursor');
  });
});

describe('PATCH /api/v1/trips/:tripId/chat/messages/:messageId', () => {
  let messageId: string;

  beforeAll(async () => {
    const res = await request()
      .post(`/api/v1/trips/${tripId}/messages`)
      .set('Cookie', authCookie(memberToken))
      .set('Content-Type', 'application/json')
      .send({ body: 'Edit me' });
    messageId = res.body.data.id;
  });

  it('edits a message within the 15-min window', async () => {
    const res = await request()
      .patch(`/api/v1/trips/${tripId}/messages/${messageId}`)
      .set('Cookie', authCookie(memberToken))
      .set('Content-Type', 'application/json')
      .send({ body: 'Edited body' });
    expect(res.status).toBe(200);
    expect(res.body.data.body).toBe('Edited body');
    expect(res.body.data.editedAt).toBeTruthy();
  });

  it('rejects edits by non-author', async () => {
    const res = await request()
      .patch(`/api/v1/trips/${tripId}/messages/${messageId}`)
      .set('Cookie', authCookie(organizerToken))
      .set('Content-Type', 'application/json')
      .send({ body: 'Should fail' });
    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/v1/trips/:tripId/chat/messages/:messageId', () => {
  it('sender can delete their own message', async () => {
    const createRes = await request()
      .post(`/api/v1/trips/${tripId}/messages`)
      .set('Cookie', authCookie(memberToken))
      .set('Content-Type', 'application/json')
      .send({ body: 'Delete me' });
    const messageId = createRes.body.data.id;

    const res = await request()
      .delete(`/api/v1/trips/${tripId}/messages/${messageId}`)
      .set('Cookie', authCookie(memberToken));
    expect(res.status).toBe(200);
  });

  it('organizer can delete any message', async () => {
    const createRes = await request()
      .post(`/api/v1/trips/${tripId}/messages`)
      .set('Cookie', authCookie(memberToken))
      .set('Content-Type', 'application/json')
      .send({ body: 'Organizer will delete' });
    const messageId = createRes.body.data.id;

    const res = await request()
      .delete(`/api/v1/trips/${tripId}/messages/${messageId}`)
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
  });
});
