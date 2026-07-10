import { toNodeHandler } from 'better-auth/node';
import { auth } from '../../common/auth.js';
import { authLimiter } from '../../middleware/rate-limit.js';

const authLimit = (req: any, res: any, next: any) => {
  if (req.method === 'GET') {
    return next();
  }
  return authLimiter(req, res, next);
};

export const authHandlers = [
  authLimit,
  toNodeHandler(auth),
];
