import { Router } from 'express';
import {
  getDocuments,
  requestUploadUrl,
  confirmUpload,
  getDownloadUrl,
  deleteDocument,
} from './documents.handlers';
import { validate } from '../../middleware/validate';
import { requireTripRole } from '../../middleware/require-trip-role';
import { uploadLimiter } from '../../middleware/rate-limit';
import { uploadConfirmSchema } from '@wend/shared';

export const documentsRouter = Router({ mergeParams: true });

documentsRouter.get(
  '/:tripId/documents',
  requireTripRole('viewer', 'member', 'organizer'),
  getDocuments,
);

documentsRouter.post(
  '/:tripId/documents/upload-url',
  requireTripRole('member', 'organizer'),
  uploadLimiter,
  requestUploadUrl,
);

documentsRouter.post(
  '/:tripId/documents/confirm',
  requireTripRole('member', 'organizer'),
  validate({ body: uploadConfirmSchema }),
  confirmUpload,
);

documentsRouter.get(
  '/:tripId/documents/:documentId/download-url',
  requireTripRole('viewer', 'member', 'organizer'),
  getDownloadUrl,
);

documentsRouter.delete(
  '/:tripId/documents/:documentId',
  requireTripRole('member', 'organizer'),
  deleteDocument,
);
