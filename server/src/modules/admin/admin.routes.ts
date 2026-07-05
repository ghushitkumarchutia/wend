import { Router } from 'express';
import * as adminController from './admin.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireRole } from '../../middleware/require-role.js';
import { adminLimiter } from '../../middleware/rate-limit.js';
import {
  createTemplateSchema,
  updateTemplateSchema,
  changeVisibilitySchema,
  addDaySchema,
  addEventSchema,
  updateTemplateEventSchema,
  reorderSchema,
} from '../../shared/schemas/templatesSchemas.js';

export const adminRouter = Router();

adminRouter.use(requireRole('admin'));
adminRouter.use(adminLimiter);

adminRouter.get('/templates', adminController.listTemplates);

adminRouter.get('/templates/stats', adminController.getStats);

adminRouter.get('/templates/:id', adminController.getTemplate);

adminRouter.post(
  '/templates',
  validate({ body: createTemplateSchema }),
  adminController.createTemplate,
);

adminRouter.patch(
  '/templates/:id',
  validate({ body: updateTemplateSchema }),
  adminController.updateTemplate,
);

adminRouter.patch(
  '/templates/:id/visibility',
  validate({ body: changeVisibilitySchema }),
  adminController.changeVisibility,
);

adminRouter.post('/templates/:id/duplicate', adminController.duplicateTemplate);

adminRouter.delete('/templates/:id', adminController.deleteTemplate);

adminRouter.post('/templates/:id/days', validate({ body: addDaySchema }), adminController.addDay);

adminRouter.patch('/templates/:id/days/:dayId', adminController.editDay);

adminRouter.delete('/templates/:id/days/:dayId', adminController.removeDay);

adminRouter.post(
  '/templates/:id/days/:dayId/events',
  validate({ body: addEventSchema }),
  adminController.addEvent,
);

adminRouter.patch(
  '/templates/:id/events/:eventId',
  validate({ body: updateTemplateEventSchema }),
  adminController.editEvent,
);

adminRouter.delete('/templates/:id/events/:eventId', adminController.removeEvent);

adminRouter.patch('/templates/reorder', validate({ body: reorderSchema }), adminController.reorder);

adminRouter.post('/templates/:id/cover-image-url', adminController.getCoverImageUrl);
