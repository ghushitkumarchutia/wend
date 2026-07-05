import type { Request, Response } from 'express';
import * as adminServices from './admin.services.js';

export async function listTemplates(req: Request, res: Response): Promise<void> {
  const page = req.query.page ? Number(req.query.page) : 1;
  const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;
  const result = await adminServices.listAllTemplates(page, pageSize);
  res.json(result);
}

export async function getStats(_req: Request, res: Response): Promise<void> {
  const stats = await adminServices.getTemplateStats();
  res.json({ data: stats });
}

export async function getTemplate(req: Request, res: Response): Promise<void> {
  const template = await adminServices.getTemplateById(req.params.id as string);
  res.json({ data: template });
}

export async function createTemplate(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const template = await adminServices.createTemplate(userId, req.body);
  res.status(201).json({ data: template });
}

export async function updateTemplate(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const template = await adminServices.updateTemplate(req.params.id as string, userId, req.body);
  res.json({ data: template });
}

export async function changeVisibility(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await adminServices.changeTemplateVisibility(
    req.params.id as string,
    userId,
    req.body.visibility,
  );
  res.json({ data: { success: true } });
}

export async function duplicateTemplate(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const template = await adminServices.duplicateTemplate(req.params.id as string, userId);
  res.status(201).json({ data: template });
}

export async function deleteTemplate(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await adminServices.deleteTemplate(req.params.id as string, userId);
  res.status(204).end();
}

export async function addDay(req: Request, res: Response): Promise<void> {
  const day = await adminServices.addDay(req.params.id as string, req.body);
  res.status(201).json({ data: day });
}

export async function editDay(req: Request, res: Response): Promise<void> {
  const day = await adminServices.editDay(req.params.dayId as string, req.body);
  res.json({ data: day });
}

export async function removeDay(req: Request, res: Response): Promise<void> {
  await adminServices.removeDay(req.params.dayId as string);
  res.status(204).end();
}

export async function addEvent(req: Request, res: Response): Promise<void> {
  const event = await adminServices.addEvent(req.params.dayId as string, req.body);
  res.status(201).json({ data: event });
}

export async function editEvent(req: Request, res: Response): Promise<void> {
  const event = await adminServices.editEvent(req.params.eventId as string, req.body);
  res.json({ data: event });
}

export async function removeEvent(req: Request, res: Response): Promise<void> {
  await adminServices.removeEvent(req.params.eventId as string);
  res.status(204).end();
}

export async function reorder(req: Request, res: Response): Promise<void> {
  await adminServices.reorderItems(req.body.items);
  res.json({ data: { success: true } });
}

export async function getCoverImageUrl(req: Request, res: Response): Promise<void> {
  const result = await adminServices.generateCoverImageUrl(req.params.id as string);
  res.json({ data: result });
}
