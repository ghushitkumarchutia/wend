import { Router } from 'express';
import { getStats } from './dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', getStats);
