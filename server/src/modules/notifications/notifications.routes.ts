import { Router } from 'express';
import * as notificationsController from './notifications.controller.js';
import { validate } from '../../middleware/validate.js';
import { generalGetLimiter, generalMutateLimiter } from '../../middleware/rate-limit.js';
import { updatePreferencesSchema } from '../../shared/schemas/notificationsSchemas.js';

export const notificationsRouter = Router();

notificationsRouter.get('/', generalGetLimiter, notificationsController.getNotifications);

notificationsRouter.get('/unread-count', generalGetLimiter, notificationsController.getUnreadCount);

notificationsRouter.patch(
  '/:notificationId/read',
  generalMutateLimiter,
  notificationsController.markRead,
);

notificationsRouter.post(
  '/mark-all-read',
  generalMutateLimiter,
  notificationsController.markAllRead,
);

notificationsRouter.patch(
  '/:notificationId/archive',
  generalMutateLimiter,
  notificationsController.archiveNotification,
);

notificationsRouter.post(
  '/archive-all-read',
  generalMutateLimiter,
  notificationsController.archiveAllRead,
);

notificationsRouter.get('/preferences', generalGetLimiter, notificationsController.getPreferences);

notificationsRouter.put(
  '/preferences',
  generalMutateLimiter,
  validate({ body: updatePreferencesSchema }),
  notificationsController.updatePreferences,
);
