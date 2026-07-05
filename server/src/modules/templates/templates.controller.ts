import type { Request, Response } from 'express';
import * as templatesServices from './templates.services.js';

export async function listPublished(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 12;
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;
  const result = await templatesServices.listPublishedTemplates(page, pageSize, search, category);
  res.json(result);
}

export async function getTemplate(req: Request, res: Response): Promise<void> {
  const template = await templatesServices.getTemplateById(req.params.templateId as string);
  res.json({ data: template });
}

export async function cloneTemplate(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const trip = await templatesServices.cloneTemplateToTrip(
    req.params.templateId as string,
    userId,
    req.body,
  );
  res.status(201).json({ data: trip });
}
