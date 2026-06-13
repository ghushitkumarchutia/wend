import type { Request, Response } from 'express';
import { TripsService } from './trips.service';
import { auth } from '../../common/auth';
import { fromNodeHeaders } from 'better-auth/node';

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

export async function createTrip(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const trip = await TripsService.create(user.id, req.body);
  res.status(201).json({ data: trip });
}

export async function getTrips(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const trips = await TripsService.list(user.id, {
    status: req.query.status as string | undefined,
    search: req.query.search as string | undefined,
    sort: req.query.sort as string | undefined,
  });
  res.json({ data: trips });
}

export async function getTrip(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const trip = await TripsService.getById(tripId, user.id);
  if (!trip) {
    const err = new Error('Not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  res.json({ data: trip });
}

export async function updateTrip(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const force = req.query.force === 'true';
  const updated = await TripsService.update(tripId, req.body, force);
  res.json({ data: updated });
}

export async function deleteTrip(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  await TripsService.remove(tripId);
  res.status(204).end();
}

export async function archiveTrip(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const updated = await TripsService.archive(tripId);
  res.json({ data: updated });
}

export async function restoreTrip(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const updated = await TripsService.restore(tripId);
  res.json({ data: updated });
}
