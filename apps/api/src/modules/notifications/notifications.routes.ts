import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markRead,
  markAllRead,
  archiveNotification,
  archiveAllRead,
  getPreferences,
  updatePreferences,
} from './notifications.handlers';
import { validate } from '../../middleware/validate';
import { updatePreferencesSchema } from '@wend/shared';

export const notificationsRouter = Router();

notificationsRouter.get('/', getNotifications);

notificationsRouter.get('/unread-count', getUnreadCount);

notificationsRouter.patch('/:notificationId/read', markRead);

notificationsRouter.post('/mark-all-read', markAllRead);

notificationsRouter.patch('/:notificationId/archive', archiveNotification);

notificationsRouter.post('/archive-all-read', archiveAllRead);

notificationsRouter.get('/preferences', getPreferences);

notificationsRouter.put(
  '/preferences',
  validate({ body: updatePreferencesSchema }),
  updatePreferences,
);
