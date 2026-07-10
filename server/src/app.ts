import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './common/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { enforceJsonContentType } from './middleware/content-type.js';
import { sessionMiddleware, requireAuth } from './middleware/session.js';
import { authHandlers } from './modules/auth/auth.routes.js';
import { tripsRouter } from './modules/trips/trips.routes.js';
import { travelersRouter, invitesRouter } from './modules/travelers/travelers.routes.js';
import { itineraryRouter } from './modules/itinerary/itinerary.routes.js';
import { ledgerRouter } from './modules/ledger/ledger.routes.js';
import { documentsRouter } from './modules/documents/documents.routes.js';
import { chatRouter } from './modules/chat/chat.routes.js';
import { pollsRouter } from './modules/polls/polls.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { accountRouter } from './modules/account/account.routes.js';
import { templatesRouter } from './modules/templates/templates.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { docsRouter } from './openapi/docs.routes.js';
import { requestLogger } from './common/logger.js';

export const app = express();

app.use(requestLogger);
app.use(helmet());
app.use(
  cors({
    origin: [env.WEB_ORIGIN, env.ADMIN_ORIGIN],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(enforceJsonContentType);

app.all('/api/auth/{*any}', ...authHandlers);

app.use('/api/v1', sessionMiddleware, requireAuth);
app.use('/api/admin', sessionMiddleware, requireAuth);

app.use('/api/v1/trips', tripsRouter);
app.use('/api/v1/trips', travelersRouter);
app.use('/api/v1/invites', invitesRouter);
app.use('/api/v1/trips', itineraryRouter);
app.use('/api/v1/trips', ledgerRouter);
app.use('/api/v1/trips', documentsRouter);
app.use('/api/v1/trips', chatRouter);
app.use('/api/v1/trips', pollsRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/account', accountRouter);
app.use('/api/v1/templates', templatesRouter);
app.use('/api/admin', adminRouter);
app.use('/api', docsRouter);

app.use((_req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Route not found', details: null },
  });
});

app.use(errorHandler);
