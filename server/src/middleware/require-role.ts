import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '../shared/enums.js';

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const userRole = (req as Request & { user?: { role?: string } }).user?.role;
    if (!userRole || !roles.includes(userRole as UserRole)) {
      const err = new Error('Forbidden') as Error & { status: number };
      err.status = 403;
      throw err;
    }
    next();
  };
}
