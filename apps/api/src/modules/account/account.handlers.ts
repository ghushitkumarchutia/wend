import type { Request, Response } from 'express';
import { AccountService } from './account.service';
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

export async function getProfile(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const profile = await AccountService.getProfile(sessionUser.id);
  res.json({ data: profile });
}

export async function updateProfile(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const updated = await AccountService.updateProfile(sessionUser.id, req.body);
  res.json({ data: updated });
}

export async function requestPhotoUrl(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const { fileType, sizeBytes } = req.body;
  const result = await AccountService.requestPhotoUrl(sessionUser.id, fileType, sizeBytes);
  res.json({ data: result });
}

export async function confirmPhoto(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const { storageKey } = req.body;
  const updated = await AccountService.confirmPhoto(sessionUser.id, storageKey);
  res.json({ data: updated });
}

export async function changeEmail(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const result = await AccountService.changeEmail(
    sessionUser.id,
    req.body.newEmail,
    req.body.currentPassword,
  );
  res.json({ data: result });
}

export async function changePassword(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const result = await AccountService.changePassword(
    sessionUser.id,
    req.body.currentPassword,
    req.body.newPassword,
  );
  res.json({ data: result });
}

export async function setPassword(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const result = await AccountService.setPassword(sessionUser.id, req.body.newPassword);
  res.json({ data: result });
}

export async function disconnectGoogle(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const result = await AccountService.disconnectGoogle(sessionUser.id);
  res.json({ data: result });
}

export async function connectGoogle(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const result = await AccountService.connectGoogle(sessionUser.id);
  res.json({ data: result });
}

export async function deleteAccount(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  await AccountService.deleteAccount(sessionUser.id);
  res.status(204).end();
}
