import type { Request, Response } from 'express';
import { TravelersService } from './travelers.service';
import { auth } from '../../common/auth';
import { env } from '../../common/env';
import { fromNodeHeaders } from 'better-auth/node';
import { db } from '../../common/db';
import { trips } from '@wend/db';
import { eq } from 'drizzle-orm';

async function getSessionUser(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    const err = new Error('Unauthorized') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return session.user;
}

async function getTripContext(tripId: string) {
  const [trip] = await db
    .select({
      name: trips.name,
      destination: trips.destination,
    })
    .from(trips)
    .where(eq(trips.id, tripId))
    .limit(1);

  if (!trip) {
    const err = new Error('Trip not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return trip;
}

export async function getMembers(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const members = await TravelersService.getMembers(tripId);
  res.json({ data: members });
}

export async function changeRole(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const targetUserId = req.params.userId as string;
  const result = await TravelersService.changeRole(tripId, targetUserId, req.body.role);
  res.json({ data: result });
}

export async function removeMember(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const targetUserId = req.params.userId as string;
  await TravelersService.removeMember(tripId, targetUserId, user.id);
  res.status(204).end();
}

export async function leaveTrip(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  await TravelersService.leaveTrip(tripId, user.id);
  res.status(204).end();
}

export async function transferOrganizer(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  await TravelersService.transferOrganizer(tripId, user.id, req.body.userId);
  res.json({ data: { message: 'Organizer role transferred successfully' } });
}

export async function getInvites(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const invites = await TravelersService.getInvites(tripId);
  res.json({ data: invites });
}

export async function sendInvite(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const trip = await getTripContext(tripId);

  await TravelersService.sendInvite(
    tripId,
    user.id,
    req.body,
    trip.name,
    user.name,
    trip.destination,
    env.WEB_ORIGIN,
  );

  res.status(201).json({ data: { message: 'Invite sent' } });
}

export async function revokeInvite(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const inviteId = req.params.inviteId as string;
  await TravelersService.revokeInvite(tripId, inviteId);
  res.json({ data: { message: 'Invite revoked' } });
}

export async function resendInvite(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const inviteId = req.params.inviteId as string;
  const trip = await getTripContext(tripId);

  await TravelersService.resendInvite(
    tripId,
    inviteId,
    user.id,
    trip.name,
    user.name,
    trip.destination,
    env.WEB_ORIGIN,
  );

  res.json({ data: { message: 'Invite resent' } });
}

export async function acceptInvite(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const result = await TravelersService.acceptInvite(req.body.token, user.id);
  res.json({ data: result });
}

export async function declineInvite(req: Request, res: Response) {
  await TravelersService.declineInvite(req.body.token);
  res.json({ data: { message: 'Invite declined' } });
}
