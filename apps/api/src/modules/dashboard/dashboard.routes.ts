import { Router } from 'express';
import { getStats } from './dashboard.handlers';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', getStats);
