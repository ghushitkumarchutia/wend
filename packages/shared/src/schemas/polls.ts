import { z } from 'zod';
import { MAX_POLL_OPTIONS, MAX_POLL_QUESTION_LENGTH } from '../constants';

export const createPollSchema = z.object({
  question: z.string().min(1).max(MAX_POLL_QUESTION_LENGTH),
  options: z.array(z.string().min(1).max(200)).min(2).max(MAX_POLL_OPTIONS),
  deadline: z.string().datetime().optional(),
}).refine(
  (data) => new Set(data.options).size === data.options.length,
  { message: 'Poll options must be unique', path: ['options'] },
);

export const castVoteSchema = z.object({
  optionId: z.string().uuid(),
});
