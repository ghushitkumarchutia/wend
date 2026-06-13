import { Router } from 'express';
import {
  getMembers,
  changeRole,
  removeMember,
  leaveTrip,
  transferOrganizer,
  getInvites,
  sendInvite,
  revokeInvite,
  resendInvite,
  acceptInvite,
  declineInvite,
} from './travelers.handlers';
import { validate } from '../../middleware/validate';
import { requireTripRole } from '../../middleware/require-trip-role';
import { inviteLimiter } from '../../middleware/rate-limit';
import {
  inviteMemberSchema,
  acceptInviteSchema,
  declineInviteSchema,
  changeRoleSchema,
  transferOrganizerSchema,
} from '@wend/shared';

export const travelersRouter = Router({ mergeParams: true });

travelersRouter.get(
  '/:tripId/members',
  requireTripRole('viewer', 'member', 'organizer'),
  getMembers,
);

travelersRouter.patch(
  '/:tripId/members/:userId/role',
  requireTripRole('organizer'),
  validate({ body: changeRoleSchema }),
  changeRole,
);

travelersRouter.delete(
  '/:tripId/members/:userId',
  requireTripRole('organizer'),
  removeMember,
);

travelersRouter.post(
  '/:tripId/leave',
  requireTripRole('viewer', 'member', 'organizer'),
  leaveTrip,
);

travelersRouter.post(
  '/:tripId/transfer-organizer',
  requireTripRole('organizer'),
  validate({ body: transferOrganizerSchema }),
  transferOrganizer,
);

travelersRouter.get(
  '/:tripId/invites',
  requireTripRole('organizer'),
  getInvites,
);

travelersRouter.post(
  '/:tripId/invites',
  requireTripRole('organizer'),
  inviteLimiter,
  validate({ body: inviteMemberSchema }),
  sendInvite,
);

travelersRouter.post(
  '/:tripId/invites/:inviteId/revoke',
  requireTripRole('organizer'),
  revokeInvite,
);

travelersRouter.post(
  '/:tripId/invites/:inviteId/resend',
  requireTripRole('organizer'),
  resendInvite,
);

travelersRouter.post(
  '/invites/accept',
  validate({ body: acceptInviteSchema }),
  acceptInvite,
);

travelersRouter.post(
  '/invites/decline',
  validate({ body: declineInviteSchema }),
  declineInvite,
);
