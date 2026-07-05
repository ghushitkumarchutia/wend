import { Router } from 'express';
import * as chatController from './chat.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireTripRole } from '../../middleware/require-trip-role.js';
import { generalGetLimiter, chatLimiter } from '../../middleware/rate-limit.js';
import { sendMessageSchema, editMessageSchema } from '../../shared/schemas/chatSchemas.js';

export const chatRouter = Router();

chatRouter.get(
  '/:tripId/messages',
  generalGetLimiter,
  requireTripRole('viewer'),
  chatController.getMessages,
);

chatRouter.post(
  '/:tripId/messages',
  chatLimiter,
  requireTripRole('member'),
  validate({ body: sendMessageSchema }),
  chatController.sendMessage,
);

chatRouter.patch(
  '/:tripId/messages/:messageId',
  chatLimiter,
  requireTripRole('member'),
  validate({ body: editMessageSchema }),
  chatController.editMessage,
);

chatRouter.delete(
  '/:tripId/messages/:messageId',
  chatLimiter,
  requireTripRole('member'),
  chatController.deleteMessage,
);
