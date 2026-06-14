import type { Request, Response } from 'express';
import { ChatService } from './chat.service';
import { auth } from '../../common/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { db } from '../../common/db';
import { tripMembers } from '@wend/db';
import { eq, and } from 'drizzle-orm';

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

async function getUserRole(tripId: string, userId: string): Promise<string> {
  const [membership] = await db
    .select({ role: tripMembers.role })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)))
    .limit(1);
  return membership?.role ?? 'viewer';
}

export async function getMessages(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 30, 50);
  const result = await ChatService.list(tripId, cursor, limit);
  res.json({ data: result.data, nextCursor: result.nextCursor });
}

export async function sendMessage(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const message = await ChatService.create(tripId, user.id, req.body.body);
  res.status(201).json({ data: message });
}

export async function editMessage(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const messageId = req.params.messageId as string;
  const updated = await ChatService.edit(messageId, tripId, user.id, req.body.body);
  res.json({ data: updated });
}

export async function deleteMessage(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const messageId = req.params.messageId as string;
  const role = await getUserRole(tripId, user.id);
  const deleted = await ChatService.softDelete(messageId, tripId, user.id, role);
  res.json({ data: deleted });
}
