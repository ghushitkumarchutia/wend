import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../common/auth.js';
import { authLimiter } from '../../middleware/rate-limit.js';

export const authRouter = Router();

authRouter.use(authLimiter);

authRouter.all('/*splat', toNodeHandler(auth));
