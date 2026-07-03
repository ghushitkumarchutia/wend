import { pgTable, text, timestamp, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.js';
import { trips } from './trips.js';

export const polls = pgTable(
  'polls',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    question: text('question').notNull(),
    status: text('status', { enum: ['open', 'closed'] })
      .notNull()
      .default('open'),
    deadline: timestamp('deadline', { withTimezone: true }),
    version: integer('version').notNull().default(1),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => user.id),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('polls_trip_idx').on(t.tripId)],
);

export const pollOptions = pgTable(
  'poll_options',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    order: integer('order').notNull().default(0),
  },
  (t) => [index('poll_options_poll_idx').on(t.pollId)],
);

export const pollVotes = pgTable(
  'poll_votes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    pollId: text('poll_id')
      .notNull()
      .references(() => polls.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    optionId: text('option_id')
      .notNull()
      .references(() => pollOptions.id, { onDelete: 'cascade' }),
    votedAt: timestamp('voted_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex('poll_votes_poll_user_idx').on(t.pollId, t.userId)],
);

export const pollsRelations = relations(polls, ({ one, many }) => ({
  trip: one(trips, { fields: [polls.tripId], references: [trips.id] }),
  createdBy: one(user, {
    fields: [polls.createdByUserId],
    references: [user.id],
  }),
  options: many(pollOptions),
  votes: many(pollVotes),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, { fields: [pollOptions.pollId], references: [polls.id] }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, { fields: [pollVotes.pollId], references: [polls.id] }),
  user: one(user, { fields: [pollVotes.userId], references: [user.id] }),
  option: one(pollOptions, {
    fields: [pollVotes.optionId],
    references: [pollOptions.id],
  }),
}));
