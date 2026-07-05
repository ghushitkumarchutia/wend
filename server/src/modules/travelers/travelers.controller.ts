import type { Request, Response } from 'express';
import * as travelersServices from './travelers.services.js';

export async function listMembers(req: Request, res: Response): Promise<void> {
  const members = await travelersServices.listTripMembers(req.params.tripId as string);
  res.json({ data: members });
}

export async function changeRole(req: Request, res: Response): Promise<void> {
  const actorId = (req as Request & { user: { id: string } }).user.id;
  await travelersServices.changeMemberRole(
    req.params.tripId as string,
    req.params.userId as string,
    req.body.role,
    actorId,
  );
  res.json({ data: { success: true } });
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  const actorId = (req as Request & { user: { id: string } }).user.id;
  await travelersServices.removeTripMember(
    req.params.tripId as string,
    req.params.userId as string,
    actorId,
  );
  res.json({ data: { success: true } });
}

export async function leaveTrip(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await travelersServices.leaveTrip(req.params.tripId as string, userId);
  res.json({ data: { success: true } });
}

export async function transferOrganizer(req: Request, res: Response): Promise<void> {
  const actorId = (req as Request & { user: { id: string } }).user.id;
  await travelersServices.transferOrganizerRole(
    req.params.tripId as string,
    actorId,
    req.body.userId,
  );
  res.json({ data: { success: true } });
}

export async function listInvites(req: Request, res: Response): Promise<void> {
  const invites = await travelersServices.listTripInvites(req.params.tripId as string);
  res.json({ data: invites });
}

export async function sendInvite(req: Request, res: Response): Promise<void> {
  const actorId = (req as Request & { user: { id: string } }).user.id;
  const invite = await travelersServices.createInvite(
    req.params.tripId as string,
    actorId,
    req.body,
  );
  res.status(201).json({ data: invite });
}

export async function revokeInvite(req: Request, res: Response): Promise<void> {
  await travelersServices.revokeInvite(req.params.tripId as string, req.params.inviteId as string);
  res.json({ data: { success: true } });
}

export async function resendInvite(req: Request, res: Response): Promise<void> {
  await travelersServices.resendInviteEmail(
    req.params.tripId as string,
    req.params.inviteId as string,
  );
  res.json({ data: { success: true } });
}

export async function acceptInvite(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await travelersServices.acceptInvite(req.body.token, userId);
  res.json({ data: { success: true } });
}

export async function declineInvite(req: Request, res: Response): Promise<void> {
  await travelersServices.declineInvite(req.body.token);
  res.json({ data: { success: true } });
}
