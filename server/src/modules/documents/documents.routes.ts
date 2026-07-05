import { Router } from 'express';
import * as documentsController from './documents.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireTripRole } from '../../middleware/require-trip-role.js';
import {
  generalGetLimiter,
  generalMutateLimiter,
  uploadLimiter,
} from '../../middleware/rate-limit.js';
import { uploadConfirmSchema } from '../../shared/schemas/documentsSchemas.js';

export const documentsRouter = Router();

documentsRouter.get(
  '/:tripId/documents',
  generalGetLimiter,
  requireTripRole('viewer'),
  documentsController.getDocuments,
);

documentsRouter.post(
  '/:tripId/documents/upload-url',
  uploadLimiter,
  requireTripRole('member'),
  documentsController.requestUploadUrl,
);

documentsRouter.post(
  '/:tripId/documents/confirm',
  generalMutateLimiter,
  requireTripRole('member'),
  validate({ body: uploadConfirmSchema }),
  documentsController.confirmUpload,
);

documentsRouter.get(
  '/:tripId/documents/:docId/download-url',
  generalGetLimiter,
  requireTripRole('viewer'),
  documentsController.getDownloadUrl,
);

documentsRouter.delete(
  '/:tripId/documents/:docId',
  generalMutateLimiter,
  requireTripRole('member'),
  documentsController.deleteDocument,
);
