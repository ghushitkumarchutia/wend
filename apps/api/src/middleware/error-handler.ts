import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import type { ApiErrorResponse } from '@wend/shared';

export function errorHandler(
  err: Error & { status?: number; statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    const body: ApiErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: err.issues,
      },
    };
    res.status(422).json(body);
    return;
  }

  const status = err.status ?? err.statusCode ?? 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;

  if (status >= 500) {
    console.error(err);
  }

  const codeMap: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    415: 'UNSUPPORTED_MEDIA_TYPE',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
  };

  const body: ApiErrorResponse = {
    error: {
      code: codeMap[status] ?? 'INTERNAL_ERROR',
      message,
      details: null,
    },
  };

  res.status(status).json(body);
}
