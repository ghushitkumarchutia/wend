import {
  pgTable,
  text,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { trips } from './trips';

export const activityLog = pgTable(
  'activity_log',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    actorUserId: text('actor_user_id')
      .notNull()
      .references(() => user.id),
    type: text('type').notNull(),
    referenceId: text('reference_id'),
    referenceType: text('reference_type'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('activity_log_trip_created_idx').on(t.tripId, t.createdAt),
  ],
);

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  trip: one(trips, {
    fields: [activityLog.tripId],
    references: [trips.id],
  }),
  actor: one(user, {
    fields: [activityLog.actorUserId],
    references: [user.id],
  }),
}));
