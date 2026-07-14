import { Router } from 'express';
import * as tripsController from './trips.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireTripRole } from '../../middleware/require-trip-role.js';
import { generalGetLimiter, generalMutateLimiter } from '../../middleware/rate-limit.js';
import { createTripSchema, updateTripSchema } from '../../shared/schemas/tripsSchemas.js';

export const tripsRouter = Router();

tripsRouter.get('/', generalGetLimiter, tripsController.listTrips);

tripsRouter.post(
  '/',
  generalMutateLimiter,
  validate({ body: createTripSchema }),
  tripsController.createTrip,
);

tripsRouter.get('/photos', generalGetLimiter, tripsController.searchPhotos);

tripsRouter.get('/:tripId', generalGetLimiter, requireTripRole('viewer'), tripsController.getTrip);

tripsRouter.patch(
  '/:tripId',
  generalMutateLimiter,
  requireTripRole('organizer'),
  validate({ body: updateTripSchema }),
  tripsController.updateTrip,
);

tripsRouter.delete(
  '/:tripId',
  generalMutateLimiter,
  requireTripRole('organizer'),
  tripsController.deleteTrip,
);

tripsRouter.post(
  '/:tripId/archive',
  generalMutateLimiter,
  requireTripRole('organizer'),
  tripsController.archiveTrip,
);

tripsRouter.post(
  '/:tripId/restore',
  generalMutateLimiter,
  requireTripRole('organizer'),
  tripsController.restoreTrip,
);

tripsRouter.get(
  '/:tripId/activity',
  generalGetLimiter,
  requireTripRole('viewer'),
  tripsController.getActivity,
);
