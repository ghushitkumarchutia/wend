import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  requestPhotoUrl,
  confirmPhoto,
  changeEmail,
  changePassword,
  setPassword,
  disconnectGoogle,
  connectGoogle,
  deleteAccount,
} from './account.handlers';
import { validate } from '../../middleware/validate';
import {
  updateProfileSchema,
  changePasswordSchema,
  setPasswordSchema,
  changeEmailSchema,
  deleteAccountConfirmSchema,
} from '@wend/shared';

export const accountRouter = Router();

accountRouter.get('/profile', getProfile);

accountRouter.patch(
  '/profile',
  validate({ body: updateProfileSchema }),
  updateProfile,
);

accountRouter.post('/profile/photo/upload-url', requestPhotoUrl);

accountRouter.post('/profile/photo/confirm', confirmPhoto);

accountRouter.post(
  '/email',
  validate({ body: changeEmailSchema }),
  changeEmail,
);

accountRouter.post(
  '/password',
  validate({ body: changePasswordSchema }),
  changePassword,
);

accountRouter.post(
  '/password/set',
  validate({ body: setPasswordSchema }),
  setPassword,
);

accountRouter.delete('/google', disconnectGoogle);

accountRouter.post('/google', connectGoogle);

accountRouter.delete(
  '/',
  validate({ body: deleteAccountConfirmSchema }),
  deleteAccount,
);
