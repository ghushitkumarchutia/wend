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
import { ledgerRouter } from './modules/ledger/ledger.routes';
import { documentsRouter } from './modules/documents/documents.routes';
import { chatRouter } from './modules/chat/chat.routes';
import { pollsRouter } from './modules/polls/polls.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { accountRouter } from './modules/account/account.routes';
import { templatesRouter } from './modules/templates/templates.routes';
import { adminRouter } from './modules/admin/admin.routes';

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
app.use('/api/v1/trips', ledgerRouter);
app.use('/api/v1/trips', documentsRouter);
app.use('/api/v1/trips', chatRouter);
app.use('/api/v1/trips', pollsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/account', accountRouter);
app.use('/api/v1/templates', templatesRouter);
app.use('/api/admin', adminRouter);

app.use(errorHandler);

export { app };
