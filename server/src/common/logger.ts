import morgan from 'morgan';
import { Request, Response } from 'express';

morgan.token('error', (req: Request, res: Response) => {
  const err = res.locals.error;
  if (!err) return '';

  const errorMessage = err.message || err.toString();
  const stack = err.stack ? `\n\x1b[31m[Stack Trace]\x1b[0m\n${err.stack}` : '';

  return `\n\x1b[31m[Error]\x1b[0m ${errorMessage}${stack}\n`;
});

morgan.token('body', (req: Request) => {
  if (!req.body || Object.keys(req.body).length === 0) return '';

  const safeBody = { ...req.body };
  if (safeBody.password) safeBody.password = '***';
  if (safeBody.newPassword) safeBody.newPassword = '***';
  if (safeBody.confirmPassword) safeBody.confirmPassword = '***';

  return `\n\x1b[36m[Body]\x1b[0m ${JSON.stringify(safeBody, null, 2)}`;
});

morgan.token('query', (req: Request) => {
  if (!req.query || Object.keys(req.query).length === 0) return '';
  return `\n\x1b[35m[Query]\x1b[0m ${JSON.stringify(req.query, null, 2)}`;
});
const morganFormat = (tokens: any, req: Request, res: Response) => {
  const status = tokens.status(req, res);

  let statusColor = '\x1b[32m';
  if (Number(status) >= 300) statusColor = '\x1b[36m';
  if (Number(status) >= 400) statusColor = '\x1b[33m';
  if (Number(status) >= 500) statusColor = '\x1b[31m';

  const method = tokens.method(req, res);
  let methodColor = '\x1b[37m';
  if (method === 'GET') methodColor = '\x1b[32m';
  if (method === 'POST') methodColor = '\x1b[34m';
  if (method === 'PUT' || method === 'PATCH') methodColor = '\x1b[33m';
  if (method === 'DELETE') methodColor = '\x1b[31m';

  const format = [
    `\x1b[90m[${tokens.date(req, res, 'iso')}]\x1b[0m`,
    `${methodColor}${method}\x1b[0m`,
    tokens.url(req, res),
    `${statusColor}${status}\x1b[0m`,
    '-',
    tokens['response-time'](req, res),
    'ms',
    tokens.query(req, res),
    tokens.body(req, res),
    tokens.error(req, res),
  ]
    .filter(Boolean)
    .join(' ');

  return format;
};

export const requestLogger = morgan(morganFormat);

export const logger = {
  info: (msg: string, meta?: any) => {
    console.log(`\x1b[90m[${new Date().toISOString()}]\x1b[0m \x1b[36mINFO\x1b[0m: ${msg}`);
    if (meta) console.dir(meta, { depth: null, colors: true });
  },
  warn: (msg: string, meta?: any) => {
    console.warn(`\x1b[90m[${new Date().toISOString()}]\x1b[0m \x1b[33mWARN\x1b[0m: ${msg}`);
    if (meta) console.dir(meta, { depth: null, colors: true });
  },
  error: (msg: string, err?: any) => {
    console.error(`\x1b[90m[${new Date().toISOString()}]\x1b[0m \x1b[31mERROR\x1b[0m: ${msg}`);
    if (err) {
      if (err instanceof Error) console.error(`\x1b[31m${err.stack}\x1b[0m`);
      else console.dir(err, { depth: null, colors: true });
    }
  },
  debug: (msg: string, meta?: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\x1b[90m[${new Date().toISOString()}]\x1b[0m \x1b[35mDEBUG\x1b[0m: ${msg}`);
      if (meta) console.dir(meta, { depth: null, colors: true });
    }
  },
};
