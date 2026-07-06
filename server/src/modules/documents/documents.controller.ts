import type { Request, Response } from 'express';
import * as documentsServices from './documents.services.js';

export async function getDocuments(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const docs = await documentsServices.listDocuments(req.params.tripId as string, userId);
  res.json({ data: docs });
}

export async function requestUploadUrl(req: Request, res: Response): Promise<void> {
  const result = await documentsServices.generateUploadUrl(
    req.params.tripId as string,
    req.body.fileType,
  );
  res.json({ data: result });
}

export async function confirmUpload(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const doc = await documentsServices.confirmDocumentUpload(
    req.params.tripId as string,
    userId,
    req.body,
  );
  res.status(201).json({ data: doc });
}

export async function getDownloadUrl(req: Request, res: Response): Promise<void> {
  const url = await documentsServices.getDocumentDownloadUrl(
    req.params.tripId as string,
    req.params.docId as string,
  );
  res.json({ data: { downloadUrl: url } });
}

export async function deleteDocument(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const tripRole = (req as Request & { tripRole: string }).tripRole;
  await documentsServices.softDeleteDocument(
    req.params.tripId as string,
    req.params.docId as string,
    userId,
    tripRole,
  );
  res.json({ data: { success: true } });
}
