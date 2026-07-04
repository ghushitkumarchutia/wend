import type { Request, Response } from 'express';
import * as tripsServices from './trips.services.js';

export async function listTrips(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const tripsList = await tripsServices.listUserTrips(userId);
  res.json({ data: tripsList });
}

export async function createTrip(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const trip = await tripsServices.createTrip(userId, req.body);
  res.status(201).json({ data: trip });
}

export async function getTrip(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const trip = await tripsServices.getTripById(req.params.tripId as string, userId);
  res.json({ data: trip });
}

export async function updateTrip(req: Request, res: Response): Promise<void> {
  const updated = await tripsServices.updateTrip(req.params.tripId as string, req.body);
  res.json({ data: updated });
}

export async function deleteTrip(req: Request, res: Response): Promise<void> {
  await tripsServices.deleteTrip(req.params.tripId as string);
  res.status(204).end();
}

export async function archiveTrip(req: Request, res: Response): Promise<void> {
  await tripsServices.archiveTrip(req.params.tripId as string);
  res.json({ data: { success: true } });
}

export async function restoreTrip(req: Request, res: Response): Promise<void> {
  await tripsServices.restoreTrip(req.params.tripId as string);
  res.json({ data: { success: true } });
}

export async function getActivity(req: Request, res: Response): Promise<void> {
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const result = await tripsServices.getActivityFeed(req.params.tripId as string, cursor, limit);
  res.json(result);
}
