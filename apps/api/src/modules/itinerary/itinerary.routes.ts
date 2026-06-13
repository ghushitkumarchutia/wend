import { Router } from 'express';
import {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  reorderEvents,
} from './itinerary.handlers';
import { validate } from '../../middleware/validate';
import { requireTripRole } from '../../middleware/require-trip-role';
import { createEventSchema, updateEventSchema, reorderEventsSchema } from '@wend/shared';

export const itineraryRouter = Router({ mergeParams: true });

itineraryRouter.get(
  '/:tripId/itinerary',
  requireTripRole('viewer', 'member', 'organizer'),
  getEvents,
);

itineraryRouter.get(
  '/:tripId/itinerary/:eventId',
  requireTripRole('viewer', 'member', 'organizer'),
  getEvent,
);

itineraryRouter.post(
  '/:tripId/itinerary',
  requireTripRole('member', 'organizer'),
  validate({ body: createEventSchema }),
  createEvent,
);

itineraryRouter.patch(
  '/:tripId/itinerary/:eventId',
  requireTripRole('member', 'organizer'),
  validate({ body: updateEventSchema }),
  updateEvent,
);

itineraryRouter.delete(
  '/:tripId/itinerary/:eventId',
  requireTripRole('organizer'),
  deleteEvent,
);

itineraryRouter.put(
  '/:tripId/itinerary/reorder',
  requireTripRole('member', 'organizer'),
  validate({ body: reorderEventsSchema }),
  reorderEvents,
);
