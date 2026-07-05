import type { Request, Response } from 'express';
import * as chatServices from './chat.services.js';

export async function getMessages(req: Request, res: Response): Promise<void> {
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const result = await chatServices.listMessages(req.params.tripId as string, cursor, limit);
  res.json(result);
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const message = await chatServices.createMessage(
    req.params.tripId as string,
    userId,
    req.body.body,
  );
  res.status(201).json({ data: message });
}

export async function editMessage(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const message = await chatServices.editMessage(
    req.params.tripId as string,
    req.params.messageId as string,
    userId,
    req.body.body,
  );
  res.json({ data: message });
}

export async function deleteMessage(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const tripRole = (req as Request & { tripRole: string }).tripRole;
  await chatServices.softDeleteMessage(
    req.params.tripId as string,
    req.params.messageId as string,
    userId,
    tripRole,
  );
  res.json({ data: { success: true } });
}
