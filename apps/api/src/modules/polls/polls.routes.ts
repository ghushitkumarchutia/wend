import { Router } from 'express';
import { getPolls, createPoll, castVote, closePoll } from './polls.handlers';
import { validate } from '../../middleware/validate';
import { requireTripRole } from '../../middleware/require-trip-role';
import { pollLimiter } from '../../middleware/rate-limit';
import { createPollSchema, castVoteSchema } from '@wend/shared';

export const pollsRouter = Router({ mergeParams: true });

pollsRouter.get(
  '/:tripId/polls',
  requireTripRole('viewer', 'member', 'organizer'),
  getPolls,
);

pollsRouter.post(
  '/:tripId/polls',
  requireTripRole('member', 'organizer'),
  pollLimiter,
  validate({ body: createPollSchema }),
  createPoll,
);

pollsRouter.post(
  '/:tripId/polls/:pollId/votes',
  requireTripRole('member', 'organizer'),
  validate({ body: castVoteSchema }),
  castVote,
);

pollsRouter.patch(
  '/:tripId/polls/:pollId/close',
  requireTripRole('organizer'),
  closePoll,
);
