import { Router } from 'express';
import * as templatesController from './templates.controller.js';
import { validate } from '../../middleware/validate.js';
import { publicLimiter, generalMutateLimiter } from '../../middleware/rate-limit.js';
import { cloneTemplateSchema } from '../../shared/schemas/templatesSchemas.js';

export const templatesRouter = Router();

templatesRouter.get('/', publicLimiter, templatesController.listPublished);

templatesRouter.get('/:templateId', publicLimiter, templatesController.getTemplate);

templatesRouter.post(
  '/:templateId/clone',
  generalMutateLimiter,
  validate({ body: cloneTemplateSchema }),
  templatesController.cloneTemplate,
);
