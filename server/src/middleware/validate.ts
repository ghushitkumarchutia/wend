import type { Request, Response, NextFunction } from 'express';
import type { ZodType } from 'zod';

interface ValidationTarget {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
}

export function validate(schema: ValidationTarget) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (schema.params) {
      req.params = schema.params.parse(req.params) as typeof req.params;
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query) as typeof req.query;
    }
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    next();
  };
}
