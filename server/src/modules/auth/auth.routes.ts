import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../common/auth.js';
import { authLimiter } from '../../middleware/rate-limit.js';

export const authRouter = Router();

authRouter.use((req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  return authLimiter(req, res, next);
});

authRouter.all('/*splat', toNodeHandler(auth));
