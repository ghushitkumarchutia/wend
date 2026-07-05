import { Router } from 'express';
import * as travelersController from './travelers.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireTripRole } from '../../middleware/require-trip-role.js';
import {
  generalGetLimiter,
  generalMutateLimiter,
  inviteLimiter,
} from '../../middleware/rate-limit.js';
import {
  inviteMemberSchema,
  changeRoleSchema,
  transferOrganizerSchema,
  acceptInviteSchema,
  declineInviteSchema,
} from '../../shared/schemas/tripsSchemas.js';

export const travelersRouter = Router();

travelersRouter.get(
  '/:tripId/members',
  generalGetLimiter,
  requireTripRole('viewer'),
  travelersController.listMembers,
);

travelersRouter.patch(
  '/:tripId/members/:userId/role',
  generalMutateLimiter,
  requireTripRole('organizer'),
  validate({ body: changeRoleSchema }),
  travelersController.changeRole,
);

travelersRouter.delete(
  '/:tripId/members/:userId',
  generalMutateLimiter,
  requireTripRole('organizer'),
  travelersController.removeMember,
);

travelersRouter.post(
  '/:tripId/members/leave',
  generalMutateLimiter,
  requireTripRole('viewer'),
  travelersController.leaveTrip,
);

travelersRouter.post(
  '/:tripId/members/transfer',
  generalMutateLimiter,
  requireTripRole('organizer'),
  validate({ body: transferOrganizerSchema }),
  travelersController.transferOrganizer,
);

travelersRouter.get(
  '/:tripId/invites',
  generalGetLimiter,
  requireTripRole('organizer'),
  travelersController.listInvites,
);

travelersRouter.post(
  '/:tripId/invites',
  inviteLimiter,
  requireTripRole('organizer'),
  validate({ body: inviteMemberSchema }),
  travelersController.sendInvite,
);

travelersRouter.post(
  '/:tripId/invites/:inviteId/revoke',
  generalMutateLimiter,
  requireTripRole('organizer'),
  travelersController.revokeInvite,
);

travelersRouter.post(
  '/:tripId/invites/:inviteId/resend',
  inviteLimiter,
  requireTripRole('organizer'),
  travelersController.resendInvite,
);

export const invitesRouter = Router();

invitesRouter.post(
  '/accept',
  generalMutateLimiter,
  validate({ body: acceptInviteSchema }),
  travelersController.acceptInvite,
);

invitesRouter.post(
  '/decline',
  generalMutateLimiter,
  validate({ body: declineInviteSchema }),
  travelersController.declineInvite,
);
