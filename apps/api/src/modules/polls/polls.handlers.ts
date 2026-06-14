import type { Request, Response } from 'express';
import { PollsService } from './polls.service';
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

export async function getPolls(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const data = await PollsService.list(tripId);
  res.json({ data });
}

export async function createPoll(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const poll = await PollsService.create(tripId, user.id, req.body);
  res.status(201).json({ data: poll });
}

export async function castVote(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const pollId = req.params.pollId as string;
  const result = await PollsService.vote(pollId, tripId, user.id, req.body.optionId);
  res.json({ data: result });
}

export async function closePoll(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const pollId = req.params.pollId as string;
  const closed = await PollsService.close(pollId, tripId, user.id);
  res.json({ data: closed });
}
