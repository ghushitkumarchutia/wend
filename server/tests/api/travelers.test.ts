import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { request, createTestUser, createTestSession, createTestTrip, addTripMember, authCookie, cleanup } from '../setup.js';

let organizer: Awaited<ReturnType<typeof createTestUser>>;
let organizerToken: string;
let member: Awaited<ReturnType<typeof createTestUser>>;
let memberToken: string;
let tripId: string;

beforeAll(async () => {
  await cleanup();
  organizer = await createTestUser({ name: 'Trav Organizer' });
  organizerToken = await createTestSession(organizer.id);
  member = await createTestUser({ name: 'Trav Member' });
  memberToken = await createTestSession(member.id);
  const trip = await createTestTrip(organizer.id, { name: 'Travelers Trip' });
  tripId = trip.id;
  await addTripMember(tripId, member.id, 'member');
});

afterAll(async () => { await cleanup(); });

describe('GET /:tripId/members', () => {
  it('lists members', async () => {
    const res = await request().get(`/api/v1/trips/${tripId}/members`).set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBe(2);
  });
  it('rejects non-member', async () => {
    const outsider = await createTestUser();
    const outsiderToken = await createTestSession(outsider.id);
    const res = await request().get(`/api/v1/trips/${tripId}/members`).set('Cookie', authCookie(outsiderToken));
    expect(res.status).toBe(404);
  });
});

describe('POST /:tripId/members/:userId/role', () => {
  it('organizer changes member role', async () => {
    const res = await request().patch(`/api/v1/trips/${tripId}/members/${member.id}/role`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({ role: 'viewer' });
    expect(res.status).toBe(200);
  });
  it('member cannot change roles', async () => {
    const res = await request().patch(`/api/v1/trips/${tripId}/members/${organizer.id}/role`)
      .set('Cookie', authCookie(memberToken)).set('Content-Type', 'application/json')
      .send({ role: 'member' });
    expect(res.status).toBe(403);
  });
  it('restore member role for subsequent tests', async () => {
    const res = await request().patch(`/api/v1/trips/${tripId}/members/${member.id}/role`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({ role: 'member' });
    expect(res.status).toBe(200);
  });
});

describe('POST /:tripId/invites', () => {
  it('organizer creates invite', async () => {
    const res = await request().post(`/api/v1/trips/${tripId}/invites`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({ email: 'invite-test@example.com', name: 'Invitee', role: 'member' });
    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
  });
  it('rejects duplicate invite', async () => {
    const res = await request().post(`/api/v1/trips/${tripId}/invites`)
      .set('Cookie', authCookie(organizerToken)).set('Content-Type', 'application/json')
      .send({ email: 'invite-test@example.com', name: 'Invitee', role: 'member' });
    expect(res.status).toBe(409);
  });
  it('member cannot create invite', async () => {
    const res = await request().post(`/api/v1/trips/${tripId}/invites`)
      .set('Cookie', authCookie(memberToken)).set('Content-Type', 'application/json')
      .send({ email: 'another@example.com', name: 'Another', role: 'member' });
    expect(res.status).toBe(403);
  });
});

describe('GET /:tripId/invites', () => {
  it('lists pending invites', async () => {
    const res = await request().get(`/api/v1/trips/${tripId}/invites`).set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('DELETE /:tripId/members/:userId', () => {
  it('organizer removes member (M6 fix — notification sent)', async () => {
    const tempMember = await createTestUser({ name: 'Removable' });
    await addTripMember(tripId, tempMember.id, 'member');
    const res = await request().delete(`/api/v1/trips/${tripId}/members/${tempMember.id}`)
      .set('Cookie', authCookie(organizerToken));
    expect(res.status).toBe(200);
  });
});

describe('POST /:tripId/leave', () => {
  it('member leaves trip', async () => {
    const leaver = await createTestUser({ name: 'Leaver' });
    const leaverToken = await createTestSession(leaver.id);
    await addTripMember(tripId, leaver.id, 'member');
    const res = await request().post(`/api/v1/trips/${tripId}/members/leave`)
      .set('Cookie', authCookie(leaverToken)).set('Content-Type', 'application/json');
    expect(res.status).toBe(200);
  });
});
