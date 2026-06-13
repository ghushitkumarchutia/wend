import type { Request, Response } from 'express';
import { DocumentsService } from './documents.service';
import { auth } from '../../common/auth';
import { fromNodeHeaders } from 'better-auth/node';
import { db } from '../../common/db';
import { tripMembers } from '@wend/db';
import { eq, and } from 'drizzle-orm';

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

async function getUserRole(tripId: string, userId: string): Promise<string> {
  const [membership] = await db
    .select({ role: tripMembers.role })
    .from(tripMembers)
    .where(and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, userId)))
    .limit(1);
  return membership?.role ?? 'viewer';
}

export async function getDocuments(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const role = await getUserRole(tripId, user.id);
  const docs = await DocumentsService.list(tripId, user.id, role);
  res.json({ data: docs });
}

export async function requestUploadUrl(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const { fileName, fileType, sizeBytes } = req.body;
  const result = await DocumentsService.requestUploadUrl(tripId, fileName, fileType, sizeBytes);
  res.json({ data: result });
}

export async function confirmUpload(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const doc = await DocumentsService.confirmUpload(tripId, user.id, req.body);
  res.status(201).json({ data: doc });
}

export async function getDownloadUrl(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const documentId = req.params.documentId as string;
  const result = await DocumentsService.getDownloadUrl(documentId, tripId, user.id);
  res.json({ data: result });
}

export async function deleteDocument(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const documentId = req.params.documentId as string;
  const role = await getUserRole(tripId, user.id);
  await DocumentsService.softDelete(documentId, tripId, user.id, role);
  res.status(204).end();
}
