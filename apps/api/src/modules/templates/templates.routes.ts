import { Router } from 'express';
import { listPublished, getTemplate, cloneTemplate } from './templates.handlers';
import { validate } from '../../middleware/validate';
import { cloneTemplateSchema } from '@wend/shared';

export const templatesRouter = Router();

templatesRouter.get('/', listPublished);

templatesRouter.get('/:templateId', getTemplate);

templatesRouter.post(
  '/:templateId/clone',
  validate({ body: cloneTemplateSchema }),
  cloneTemplate,
);
