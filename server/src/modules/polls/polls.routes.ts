import { Router } from 'express';
import * as pollsController from './polls.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireTripRole } from '../../middleware/require-trip-role.js';
import {
  generalGetLimiter,
  pollLimiter,
  generalMutateLimiter,
} from '../../middleware/rate-limit.js';
import { createPollSchema, castVoteSchema } from '../../shared/schemas/pollsSchemas.js';

export const pollsRouter = Router();

pollsRouter.get(
  '/:tripId/polls',
  generalGetLimiter,
  requireTripRole('viewer'),
  pollsController.getPolls,
);

pollsRouter.post(
  '/:tripId/polls',
  pollLimiter,
  requireTripRole('member'),
  validate({ body: createPollSchema }),
  pollsController.createPoll,
);

pollsRouter.post(
  '/:tripId/polls/:pollId/votes',
  generalMutateLimiter,
  requireTripRole('member'),
  validate({ body: castVoteSchema }),
  pollsController.castVote,
);

pollsRouter.patch(
  '/:tripId/polls/:pollId/close',
  generalMutateLimiter,
  requireTripRole('organizer'),
  pollsController.closePoll,
);
