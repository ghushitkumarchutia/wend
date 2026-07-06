import { Router } from 'express';
import * as itineraryController from './itinerary.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireTripRole } from '../../middleware/require-trip-role.js';
import { generalGetLimiter, generalMutateLimiter } from '../../middleware/rate-limit.js';
import {
  createEventSchema,
  updateEventSchema,
  reorderEventsSchema,
} from '../../shared/schemas/itinerarySchemas.js';

export const itineraryRouter = Router();

itineraryRouter.get(
  '/:tripId/itinerary',
  generalGetLimiter,
  requireTripRole('viewer'),
  itineraryController.getEvents,
);

itineraryRouter.post(
  '/:tripId/itinerary',
  generalMutateLimiter,
  requireTripRole('member'),
  validate({ body: createEventSchema }),
  itineraryController.createEvent,
);

itineraryRouter.patch(
  '/:tripId/itinerary/reorder',
  generalMutateLimiter,
  requireTripRole('member'),
  validate({ body: reorderEventsSchema }),
  itineraryController.reorderEvents,
);

itineraryRouter.get(
  '/:tripId/itinerary/:eventId',
  generalGetLimiter,
  requireTripRole('viewer'),
  itineraryController.getEvent,
);

itineraryRouter.patch(
  '/:tripId/itinerary/:eventId',
  generalMutateLimiter,
  requireTripRole('member'),
  validate({ body: updateEventSchema }),
  itineraryController.updateEvent,
);

itineraryRouter.delete(
  '/:tripId/itinerary/:eventId',
  generalMutateLimiter,
  requireTripRole('member'),
  itineraryController.deleteEvent,
);
