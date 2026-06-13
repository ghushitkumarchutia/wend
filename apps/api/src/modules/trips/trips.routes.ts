import { Router } from 'express';
import {
  createTrip,
  getTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  archiveTrip,
  restoreTrip,
} from './trips.handlers';
import { validate } from '../../middleware/validate';
import { requireTripRole } from '../../middleware/require-trip-role';
import { createTripSchema, updateTripSchema } from '@wend/shared';

export const tripsRouter = Router();

tripsRouter.post('/', validate({ body: createTripSchema }), createTrip);

tripsRouter.get('/', getTrips);

tripsRouter.get('/:tripId', requireTripRole('viewer', 'member', 'organizer'), getTrip);

tripsRouter.patch(
  '/:tripId',
  requireTripRole('organizer'),
  validate({ body: updateTripSchema }),
  updateTrip,
);

tripsRouter.delete('/:tripId', requireTripRole('organizer'), deleteTrip);

tripsRouter.post('/:tripId/archive', requireTripRole('organizer'), archiveTrip);

tripsRouter.post('/:tripId/restore', requireTripRole('organizer'), restoreTrip);
