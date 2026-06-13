import {
  pgTable,
  text,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { trips } from './trips';

export const messages = pgTable(
  'messages',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    body: text('body').notNull(),
    editedAt: timestamp('edited_at'),
    deletedAt: timestamp('deleted_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('messages_trip_created_idx').on(t.tripId, t.createdAt)],
);

export const messagesRelations = relations(messages, ({ one }) => ({
  trip: one(trips, { fields: [messages.tripId], references: [trips.id] }),
  user: one(user, { fields: [messages.userId], references: [user.id] }),
}));
