import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './common/env';
import { errorHandler } from './middleware/error-handler';
import { enforceJsonContentType } from './middleware/content-type';
import { authRouter } from './modules/auth/auth.routes';
import { tripsRouter } from './modules/trips/trips.routes';
import { travelersRouter } from './modules/travelers/travelers.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { itineraryRouter } from './modules/itinerary/itinerary.routes';

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

app.use('/api/auth', authRouter);

app.use(express.json());
app.use(enforceJsonContentType);

app.use('/api/v1/trips', tripsRouter);
app.use('/api/v1/trips', travelersRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/trips', itineraryRouter);

app.use(errorHandler);

export { app };
