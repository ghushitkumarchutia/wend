import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '@wend/shared';

export function errorHandler(
  err: Error & { status?: number; statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const status = err.status ?? err.statusCode ?? 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message;

  if (status >= 500) {
    console.error(err);
  }

  const body: ApiErrorResponse = {
    error: {
      code: status === 404 ? 'NOT_FOUND' : status === 403 ? 'FORBIDDEN' : status === 401 ? 'UNAUTHORIZED' : status === 409 ? 'CONFLICT' : status === 422 ? 'VALIDATION_ERROR' : status === 429 ? 'RATE_LIMITED' : 'INTERNAL_ERROR',
      message,
      details: null,
    },
  };

  res.status(status).json(body);
}
