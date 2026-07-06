import type { Request, Response } from 'express';
import * as accountServices from './account.services.js';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const profile = await accountServices.getUserProfile(userId);
  res.json({ data: profile });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const updated = await accountServices.updateUserProfile(userId, req.body);
  res.json({ data: updated });
}

export async function requestPhotoUrl(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const { fileType } = req.body;
  const result = await accountServices.getAvatarUploadUrl(userId, fileType);
  res.json({ data: result });
}

export async function confirmPhoto(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const { storageKey } = req.body;
  await accountServices.confirmAvatarUpload(userId, storageKey);
  res.json({ data: { success: true } });
}

export async function changeEmail(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await accountServices.changeUserEmail(userId, req.body);
  res.json({ data: { success: true } });
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await accountServices.changeUserPassword(userId, req.body, req.headers);
  res.json({ data: { success: true } });
}

export async function setPassword(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await accountServices.setUserPassword(userId, req.body);
  res.json({ data: { success: true } });
}

export async function disconnectGoogle(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await accountServices.disconnectGoogleAccount(userId);
  res.json({ data: { success: true } });
}

export async function connectGoogle(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await accountServices.connectGoogleAccount(userId, req.body);
  res.json({ data: { success: true } });
}

export async function deleteAccount(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await accountServices.softDeleteAccount(userId);
  res.json({ data: { success: true } });
}
