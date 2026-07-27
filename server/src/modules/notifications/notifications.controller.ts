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

const uiToBackendMap: Record<string, string[]> = {
  trip_invites: ['trip_invite_received'],
  trip_updates: [
    'invite_accepted', 'invite_declined', 'member_joined', 'member_left', 'member_removed',
    'role_changed', 'organizer_transferred', 'event_created', 'event_updated', 'event_cancelled',
    'expense_added', 'expense_updated', 'settlement_recorded', 'poll_created', 'poll_closed',
    'poll_vote_changed', 'document_uploaded', 'document_deleted'
  ],
  chat_mentions: ['message_mention'],
  reminders: ['trip_departure_reminder', 'event_reminder'],
  daily_digest: ['daily_digest'],
  marketing: ['marketing']
};

const backendToUiMap: Record<string, string> = {};
for (const [uiKey, backendKeys] of Object.entries(uiToBackendMap)) {
  for (const backendKey of backendKeys) {
    backendToUiMap[backendKey] = uiKey;
  }
}

function mapToFrontendFormat(prefs: Array<{ type: string; inApp: boolean; email: boolean }>) {
  const result = {
    email: {
      trip_invites: false,
      trip_updates: false,
      daily_digest: false,
      marketing: false,
    },
    push: {
      trip_invites: true,
      trip_updates: true,
      chat_mentions: true,
      reminders: true,
    },
  };

  for (const pref of prefs) {
    const uiKey = backendToUiMap[pref.type] || pref.type;

    if (uiKey in result.email) {
      result.email[uiKey as keyof typeof result.email] = pref.email;
    }
    if (uiKey in result.push) {
      result.push[uiKey as keyof typeof result.push] = pref.inApp;
    }
  }

  return result;
}

export async function getPreferences(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const prefs = await notificationsServices.getUserPreferences(userId);
  res.json({ data: mapToFrontendFormat(prefs) });
}

export async function updatePreferences(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const updates = req.body; // e.g. { email: { trip_invites: false } }

  const updatesMap = new Map<string, { type: string; inApp?: boolean; email?: boolean }>();

  if (updates.email) {
    for (const [key, value] of Object.entries(updates.email)) {
      if (!updatesMap.has(key)) updatesMap.set(key, { type: key });
      updatesMap.get(key)!.email = value as boolean;
    }
  }

  if (updates.push) {
    for (const [key, value] of Object.entries(updates.push)) {
      if (!updatesMap.has(key)) updatesMap.set(key, { type: key });
      updatesMap.get(key)!.inApp = value as boolean;
    }
  }

  const prefsToUpsert = Array.from(updatesMap.values()).flatMap((upd) => {
    const backendKeys = uiToBackendMap[upd.type] || [upd.type];
    return backendKeys.map(bk => ({
      type: bk,
      inApp: upd.inApp,
      email: upd.email
    }));
  });

  if (prefsToUpsert.length > 0) {
    await notificationsServices.upsertPreferences(userId, prefsToUpsert);
  }

  const updatedPrefs = await notificationsServices.getUserPreferences(userId);
  res.json({ data: mapToFrontendFormat(updatedPrefs) });
}
