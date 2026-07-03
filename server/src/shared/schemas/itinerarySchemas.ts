import { z } from 'zod';
import { EventCategory, EventStatus } from '../enums.js';
import { MAX_TRIP_NAME_LENGTH } from '../constants.js';

export const flightDetailsSchema = z.object({
  airline: z.string().optional(),
  flightNumber: z.string().optional(),
  departureAirport: z.string().optional(),
  arrivalAirport: z.string().optional(),
  confirmationRef: z.string().optional(),
  terminal: z.string().optional(),
  gate: z.string().optional(),
  seat: z.string().optional(),
  baggageAllowance: z.string().optional(),
});

export const createEventSchema = z.object({
  title: z.string().min(1).max(MAX_TRIP_NAME_LENGTH),
  category: z.enum(EventCategory),
  status: z.enum(EventStatus).default('confirmed'),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  location: z.string().max(200).optional(),
  notes: z.string().max(1000).optional(),
  flightDetails: flightDetailsSchema.optional(),
});

export const updateEventSchema = z
  .object({
    title: z.string().min(1).max(MAX_TRIP_NAME_LENGTH),
    category: z.enum(EventCategory),
    status: z.enum(EventStatus),
    startAt: z.string().datetime(),
    endAt: z.string().datetime().nullable(),
    location: z.string().max(200).nullable(),
    notes: z.string().max(1000).nullable(),
    flightDetails: flightDetailsSchema.nullable(),
  })
  .partial()
  .extend({
    version: z.number().int().positive(),
  });

export const reorderEventsSchema = z.object({
  events: z
    .array(
      z.object({
        id: z.string().uuid(),
        order: z.number(),
      }),
    )
    .min(1),
});
