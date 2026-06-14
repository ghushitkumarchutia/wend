import { Router } from 'express';
import {
  listTemplates,
  getStats,
  getTemplate,
  createTemplate,
  updateTemplate,
  changeVisibility,
  duplicateTemplate,
  deleteTemplate,
  addDay,
  editDay,
  removeDay,
  addEvent,
  editEvent,
  removeEvent,
  reorder,
  getCoverImageUrl,
} from './admin.handlers';
import { validate } from '../../middleware/validate';
import { requireRole } from '../../middleware/require-role';
import { adminLimiter } from '../../middleware/rate-limit';
import {
  createTemplateSchema,
  updateTemplateSchema,
  changeVisibilitySchema,
  addDaySchema,
  addEventSchema,
  updateTemplateEventSchema,
  reorderSchema,
} from '@wend/shared';

export const adminRouter = Router();

adminRouter.use(requireRole('admin'));
adminRouter.use(adminLimiter);

adminRouter.get('/templates', listTemplates);

adminRouter.get('/templates/stats', getStats);

adminRouter.get('/templates/:templateId', getTemplate);

adminRouter.post(
  '/templates',
  validate({ body: createTemplateSchema }),
  createTemplate,
);

adminRouter.patch(
  '/templates/:templateId',
  validate({ body: updateTemplateSchema }),
  updateTemplate,
);

adminRouter.patch(
  '/templates/:templateId/visibility',
  validate({ body: changeVisibilitySchema }),
  changeVisibility,
);

adminRouter.post('/templates/:templateId/duplicate', duplicateTemplate);

adminRouter.delete('/templates/:templateId', deleteTemplate);

adminRouter.post(
  '/templates/:templateId/days',
  validate({ body: addDaySchema }),
  addDay,
);

adminRouter.patch('/templates/days/:dayId', editDay);

adminRouter.delete('/templates/days/:dayId', removeDay);

adminRouter.post(
  '/templates/days/:dayId/events',
  validate({ body: addEventSchema }),
  addEvent,
);

adminRouter.patch(
  '/templates/events/:eventId',
  validate({ body: updateTemplateEventSchema }),
  editEvent,
);

adminRouter.delete('/templates/events/:eventId', removeEvent);

adminRouter.post(
  '/templates/reorder',
  validate({ body: reorderSchema }),
  reorder,
);

adminRouter.post('/templates/cover-image-url', getCoverImageUrl);
