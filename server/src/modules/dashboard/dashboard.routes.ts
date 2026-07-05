import { Router } from 'express';
import { getStats } from './dashboard.controller.js';
import { generalGetLimiter } from '../../middleware/rate-limit.js';

export const dashboardRouter = Router();

dashboardRouter.get('/stats', generalGetLimiter, getStats);
