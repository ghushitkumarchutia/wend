import type { Request, Response } from 'express';
import { ItineraryService } from './itinerary.service';
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

export async function getEvents(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const events = await ItineraryService.list(tripId);
  res.json({ data: events });
}

export async function getEvent(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const eventId = req.params.eventId as string;
  const event = await ItineraryService.getById(eventId, tripId);
  if (!event) {
    const err = new Error('Event not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  res.json({ data: event });
}

export async function createEvent(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const event = await ItineraryService.create(tripId, user.id, req.body);
  res.status(201).json({ data: event });
}

export async function updateEvent(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const eventId = req.params.eventId as string;
  const event = await ItineraryService.update(eventId, tripId, user.id, req.body);
  res.json({ data: event });
}

export async function deleteEvent(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const eventId = req.params.eventId as string;
  await ItineraryService.remove(eventId, tripId, user.id);
  res.status(204).end();
}

export async function reorderEvents(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  await ItineraryService.reorder(tripId, req.body.events);
  res.json({ data: { message: 'Events reordered' } });
}
