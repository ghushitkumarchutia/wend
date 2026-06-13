import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './common/env';
import { auth } from './common/auth';
import { errorHandler } from './middleware/error-handler';
import { toNodeHandler } from 'better-auth/node';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: env.NODE_ENV === 'production' ? undefined : false,
  }),
);

app.use(
  cors({
    origin: [env.WEB_ORIGIN, env.ADMIN_ORIGIN],
    credentials: true,
  }),
);

app.use(cookieParser());

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.json());

app.use(errorHandler);

export { app };
