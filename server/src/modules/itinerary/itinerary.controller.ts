import type { Request, Response } from 'express';
import * as itineraryServices from './itinerary.services.js';

export async function getEvents(req: Request, res: Response): Promise<void> {
  const events = await itineraryServices.listEvents(req.params.tripId as string);
  res.json({ data: events });
}

export async function getEvent(req: Request, res: Response): Promise<void> {
  const event = await itineraryServices.getEventById(
    req.params.tripId as string,
    req.params.eventId as string,
  );
  res.json({ data: event });
}

export async function createEvent(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const event = await itineraryServices.createEvent(req.params.tripId as string, userId, req.body);
  res.status(201).json({ data: event });
}

export async function updateEvent(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const event = await itineraryServices.updateEvent(
    req.params.tripId as string,
    req.params.eventId as string,
    userId,
    req.body,
  );
  res.json({ data: event });
}

export async function deleteEvent(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await itineraryServices.deleteEvent(
    req.params.tripId as string,
    req.params.eventId as string,
    userId,
  );
  res.status(204).end();
}

export async function reorderEvents(req: Request, res: Response): Promise<void> {
  await itineraryServices.reorderEvents(req.params.tripId as string, req.body.events);
  res.json({ data: { success: true } });
}
