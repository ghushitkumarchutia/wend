import type { Request, Response } from 'express';
import { NotificationsService } from './notifications.service';
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

export async function getNotifications(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const status = req.query.status as string | undefined;
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const result = await NotificationsService.list(user.id, status, cursor, limit);
  res.json({ data: result.data, nextCursor: result.nextCursor });
}

export async function getUnreadCount(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const count = await NotificationsService.unreadCount(user.id);
  res.json({ data: { count } });
}

export async function markRead(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const notificationId = req.params.notificationId as string;
  const updated = await NotificationsService.markRead(notificationId, user.id);
  res.json({ data: updated });
}

export async function markAllRead(req: Request, res: Response) {
  const user = await getSessionUser(req);
  await NotificationsService.markAllRead(user.id);
  res.status(204).end();
}

export async function archiveNotification(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const notificationId = req.params.notificationId as string;
  const updated = await NotificationsService.archive(notificationId, user.id);
  res.json({ data: updated });
}

export async function archiveAllRead(req: Request, res: Response) {
  const user = await getSessionUser(req);
  await NotificationsService.archiveAllRead(user.id);
  res.status(204).end();
}

export async function getPreferences(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const prefs = await NotificationsService.getPreferences(user.id);
  res.json({ data: prefs });
}

export async function updatePreferences(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const prefs = await NotificationsService.updatePreferences(user.id, req.body.preferences);
  res.json({ data: prefs });
}
