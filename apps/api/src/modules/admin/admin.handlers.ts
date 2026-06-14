import type { Request, Response } from 'express';
import { AdminService } from './admin.service';
import { auth } from '../../common/auth';
import { fromNodeHeaders } from 'better-auth/node';

async function getSessionUser(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    const err = new Error('Unauthorized') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return session.user;
}

export async function listTemplates(req: Request, res: Response) {
  const result = await AdminService.listTemplates({
    q: req.query.q as string | undefined,
    visibility: req.query.visibility as string | undefined,
    sort: req.query.sort as string | undefined,
    page: Number(req.query.page) || 1,
    limit: Math.min(Number(req.query.limit) || 20, 100),
  });
  res.json(result);
}

export async function getStats(_req: Request, res: Response) {
  const stats = await AdminService.getStats();
  res.json({ data: stats });
}

export async function getTemplate(req: Request, res: Response) {
  const templateId = req.params.templateId as string;
  const tmpl = await AdminService.getTemplate(templateId);
  res.json({ data: tmpl });
}

export async function createTemplate(req: Request, res: Response) {
  const adminUser = await getSessionUser(req);
  const tmpl = await AdminService.createTemplate(adminUser.id, req.body);
  res.status(201).json({ data: tmpl });
}

export async function updateTemplate(req: Request, res: Response) {
  const adminUser = await getSessionUser(req);
  const templateId = req.params.templateId as string;
  const updated = await AdminService.updateTemplate(templateId, adminUser.id, req.body);
  res.json({ data: updated });
}

export async function changeVisibility(req: Request, res: Response) {
  const adminUser = await getSessionUser(req);
  const templateId = req.params.templateId as string;
  const updated = await AdminService.changeVisibility(templateId, adminUser.id, req.body.visibility);
  res.json({ data: updated });
}

export async function duplicateTemplate(req: Request, res: Response) {
  const adminUser = await getSessionUser(req);
  const templateId = req.params.templateId as string;
  const duplicate = await AdminService.duplicateTemplate(templateId, adminUser.id);
  res.status(201).json({ data: duplicate });
}

export async function deleteTemplate(req: Request, res: Response) {
  const adminUser = await getSessionUser(req);
  const templateId = req.params.templateId as string;
  await AdminService.deleteTemplate(templateId, adminUser.id);
  res.status(204).end();
}

export async function addDay(req: Request, res: Response) {
  const templateId = req.params.templateId as string;
  const day = await AdminService.addDay(templateId, req.body.dayNumber);
  res.status(201).json({ data: day });
}

export async function editDay(req: Request, res: Response) {
  const dayId = req.params.dayId as string;
  const updated = await AdminService.editDay(dayId, req.body);
  res.json({ data: updated });
}

export async function removeDay(req: Request, res: Response) {
  const dayId = req.params.dayId as string;
  await AdminService.removeDay(dayId);
  res.status(204).end();
}

export async function addEvent(req: Request, res: Response) {
  const dayId = req.params.dayId as string;
  const event = await AdminService.addEvent(dayId, req.body);
  res.status(201).json({ data: event });
}

export async function editEvent(req: Request, res: Response) {
  const eventId = req.params.eventId as string;
  const updated = await AdminService.editEvent(eventId, req.body);
  res.json({ data: updated });
}

export async function removeEvent(req: Request, res: Response) {
  const eventId = req.params.eventId as string;
  await AdminService.removeEvent(eventId);
  res.status(204).end();
}

export async function reorder(req: Request, res: Response) {
  const table = req.query.table as 'days' | 'events';
  await AdminService.reorder(req.body.items, table);
  res.status(204).end();
}

export async function getCoverImageUrl(req: Request, res: Response) {
  const { fileType } = req.body;
  const result = await AdminService.getCoverImageUrl(fileType);
  res.json({ data: result });
}
