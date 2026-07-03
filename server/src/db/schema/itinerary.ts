import { pgTable, text, timestamp, integer, doublePrecision, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.js';
import { trips } from './trips.js';

export const itineraryEvents = pgTable(
  'itinerary_events',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    category: text('category', {
      enum: ['flight', 'hotel', 'restaurant', 'activity', 'transport', 'other'],
    }).notNull(),
    status: text('status', {
      enum: ['confirmed', 'tentative', 'cancelled'],
    })
      .notNull()
      .default('confirmed'),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }),
    location: text('location'),
    notes: text('notes'),
    order: doublePrecision('order').notNull().default(0),
    version: integer('version').notNull().default(1),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('itinerary_events_trip_start_idx').on(t.tripId, t.startAt)],
);

export const itineraryFlightDetails = pgTable('itinerary_flight_details', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventId: text('event_id')
    .notNull()
    .unique()
    .references(() => itineraryEvents.id, { onDelete: 'cascade' }),
  airline: text('airline'),
  flightNumber: text('flight_number'),
  departureAirport: text('departure_airport'),
  arrivalAirport: text('arrival_airport'),
  confirmationRef: text('confirmation_ref'),
  terminal: text('terminal'),
  gate: text('gate'),
  seat: text('seat'),
  baggageAllowance: text('baggage_allowance'),
});

export const itineraryEventsRelations = relations(itineraryEvents, ({ one }) => ({
  trip: one(trips, {
    fields: [itineraryEvents.tripId],
    references: [trips.id],
  }),
  createdBy: one(user, {
    fields: [itineraryEvents.createdByUserId],
    references: [user.id],
  }),
  flightDetails: one(itineraryFlightDetails, {
    fields: [itineraryEvents.id],
    references: [itineraryFlightDetails.eventId],
  }),
}));

export const itineraryFlightDetailsRelations = relations(itineraryFlightDetails, ({ one }) => ({
  event: one(itineraryEvents, {
    fields: [itineraryFlightDetails.eventId],
    references: [itineraryEvents.id],
  }),
}));
