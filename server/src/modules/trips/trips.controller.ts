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

export async function searchPhotos(req: Request, res: Response): Promise<void> {
  const query = (req.query.query as string) || 'travel';
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    const fallbacks = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80',
    ];
    res.json({ data: fallbacks });
    return;
  }

  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`;
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
    });

    if (!response.ok) {
      res.json({ data: [] });
      return;
    }

    const body = (await response.json()) as { results: Array<{ urls: { regular: string } }> };
    const urls = body.results.map((img) => img.urls.regular);
    res.json({ data: urls });
  } catch {
    res.json({ data: [] });
  }
}
