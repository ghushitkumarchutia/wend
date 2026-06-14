import { Router } from 'express';
import { generateDocument } from './generator';
import swaggerUi from 'swagger-ui-express';

export const docsRouter = Router();

const document = generateDocument();

docsRouter.get('/openapi.json', (_req, res) => {
  res.json(document);
});

docsRouter.use('/', swaggerUi.serve, swaggerUi.setup(document));
