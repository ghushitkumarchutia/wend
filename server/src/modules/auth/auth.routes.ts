import { Router } from 'express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../common/auth.js';
import { authLimiter } from '../../middleware/rate-limit.js';

export const authRouter = Router();

authRouter.use((req, res, next) => {
  console.log('[AuthRoute Debug]', {
    method: req.method,
    path: req.path,
    url: req.url,
    originalUrl: req.originalUrl,
  });
  next();
});

authRouter.use((req, res, next) => {
  if (req.method === 'GET') {
    return next();
  }
  return authLimiter(req, res, next);
});

authRouter.use((req, res, next) => {
  req.url = req.originalUrl;
  next();
});

authRouter.use(toNodeHandler(auth));
