import type { Request, Response } from 'express';
import * as notificationsServices from './notifications.services.js';

export async function getNotifications(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const result = await notificationsServices.listNotifications(userId, cursor, limit);
  res.json(result);
}

export async function getUnreadCount(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const count = await notificationsServices.getUnreadCount(userId);
  res.json({ data: { count } });
}

export async function markRead(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await notificationsServices.markAsRead(userId, req.params.notificationId as string);
  res.json({ data: { success: true } });
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await notificationsServices.markAllAsRead(userId);
  res.json({ data: { success: true } });
}

export async function archiveNotification(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await notificationsServices.archiveOne(userId, req.params.notificationId as string);
  res.json({ data: { success: true } });
}

export async function archiveAllRead(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await notificationsServices.archiveAllRead(userId);
  res.json({ data: { success: true } });
}

export async function getPreferences(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const prefs = await notificationsServices.getUserPreferences(userId);
  res.json({ data: prefs });
}

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await notificationsServices.upsertPreferences(userId, req.body.preferences);
  res.json({ data: { success: true } });
}
