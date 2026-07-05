import type { Request, Response } from 'express';
import * as pollsServices from './polls.services.js';

export async function getPolls(req: Request, res: Response): Promise<void> {
  const polls = await pollsServices.listPolls(req.params.tripId as string);
  res.json({ data: polls });
}

export async function createPoll(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const poll = await pollsServices.createPoll(req.params.tripId as string, userId, req.body);
  res.status(201).json({ data: poll });
}

export async function castVote(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await pollsServices.castOrChangeVote(
    req.params.tripId as string,
    req.params.pollId as string,
    userId,
    req.body.optionId,
  );
  res.json({ data: { success: true } });
}

export async function closePoll(req: Request, res: Response): Promise<void> {
  await pollsServices.closePoll(req.params.tripId as string, req.params.pollId as string);
  res.json({ data: { success: true } });
}
