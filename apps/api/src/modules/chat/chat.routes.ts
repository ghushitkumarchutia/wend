import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
} from './chat.handlers';
import { validate } from '../../middleware/validate';
import { requireTripRole } from '../../middleware/require-trip-role';
import { chatLimiter } from '../../middleware/rate-limit';
import { sendMessageSchema, editMessageSchema } from '@wend/shared';

export const chatRouter = Router({ mergeParams: true });

chatRouter.get(
  '/:tripId/messages',
  requireTripRole('viewer', 'member', 'organizer'),
  getMessages,
);

chatRouter.post(
  '/:tripId/messages',
  requireTripRole('member', 'organizer'),
  chatLimiter,
  validate({ body: sendMessageSchema }),
  sendMessage,
);

chatRouter.patch(
  '/:tripId/messages/:messageId',
  requireTripRole('member', 'organizer'),
  validate({ body: editMessageSchema }),
  editMessage,
);

chatRouter.delete(
  '/:tripId/messages/:messageId',
  requireTripRole('member', 'organizer'),
  deleteMessage,
);
