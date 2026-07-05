import type { Request, Response, NextFunction } from 'express';
import { auth } from '../common/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

export async function sessionMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (session) {
    (req as Request & { user: typeof session.user; session: typeof session.session }).user =
      session.user;
    (req as Request & { user: typeof session.user; session: typeof session.session }).session =
      session.session;
  }

  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as Request & { user?: { id?: string } }).user;

  if (!user?.id) {
    const err = new Error('Unauthorized') as Error & { status: number };
    err.status = 401;
    throw err;
  }

  next();
}
