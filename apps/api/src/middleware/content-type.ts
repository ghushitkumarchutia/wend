import type { Request, Response, NextFunction } from 'express';

export function enforceJsonContentType(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const method = req.method.toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const contentType = req.headers['content-type'];
    if (
      contentType &&
      !contentType.startsWith('application/json') &&
      !contentType.startsWith('multipart/form-data')
    ) {
      const err = new Error('Content-Type must be application/json') as Error & {
        status: number;
      };
      err.status = 415;
      throw err;
    }
    if (!contentType && req.body !== undefined && Object.keys(req.body).length > 0) {
      const err = new Error('Content-Type header is required') as Error & {
        status: number;
      };
      err.status = 415;
      throw err;
    }
  }
  next();
}
