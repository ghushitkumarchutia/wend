import type { Request, Response } from 'express';
import * as dashboardServices from './dashboard.services.js';

export async function getStats(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string; email: string } }).user.id;
  const userEmail = (req as Request & { user: { id: string; email: string } }).user.email;

  const stats = await dashboardServices.getDashboardStats(userId, userEmail);

  res.json({ data: stats });
}
