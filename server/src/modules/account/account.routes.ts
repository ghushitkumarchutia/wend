import { Router } from 'express';
import * as accountController from './account.controller.js';
import { validate } from '../../middleware/validate.js';
import { generalMutateLimiter, uploadLimiter } from '../../middleware/rate-limit.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  setPasswordSchema,
  changeEmailSchema,
  deleteAccountConfirmSchema,
  avatarUploadSchema,
  photoConfirmSchema,
} from '../../shared/schemas/accountSchemas.js';

export const accountRouter = Router();

accountRouter.get('/profile', accountController.getProfile);

accountRouter.patch(
  '/profile',
  generalMutateLimiter,
  validate({ body: updateProfileSchema }),
  accountController.updateProfile,
);

accountRouter.post(
  '/profile/photo-url',
  uploadLimiter,
  validate({ body: avatarUploadSchema }),
  accountController.requestPhotoUrl,
);

accountRouter.post(
  '/profile/photo-confirm',
  generalMutateLimiter,
  validate({ body: photoConfirmSchema }),
  accountController.confirmPhoto,
);

accountRouter.post(
  '/change-email',
  generalMutateLimiter,
  validate({ body: changeEmailSchema }),
  accountController.changeEmail,
);

accountRouter.post(
  '/change-password',
  generalMutateLimiter,
  validate({ body: changePasswordSchema }),
  accountController.changePassword,
);

accountRouter.post(
  '/set-password',
  generalMutateLimiter,
  validate({ body: setPasswordSchema }),
  accountController.setPassword,
);

accountRouter.delete('/google', generalMutateLimiter, accountController.disconnectGoogle);

accountRouter.post('/connect-google', generalMutateLimiter, accountController.connectGoogle);

accountRouter.delete(
  '/',
  generalMutateLimiter,
  validate({ body: deleteAccountConfirmSchema }),
  accountController.deleteAccount,
);
