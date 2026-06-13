import {
  pgTable,
  text,
  timestamp,
  numeric,
  integer,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';
import { trips } from './trips';

export const expenses = pgTable(
  'expenses',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    currency: text('currency').notNull(),
    category: text('category', {
      enum: [
        'accommodation',
        'food_and_drinks',
        'transport',
        'activities',
        'miscellaneous',
      ],
    }).notNull(),
    paidByUserId: text('paid_by_user_id')
      .notNull()
      .references(() => user.id),
    splitMethod: text('split_method', {
      enum: ['equal', 'unequal', 'percentage', 'custom'],
    })
      .notNull()
      .default('equal'),
    receiptUrl: text('receipt_url'),
    incurredAt: timestamp('incurred_at').notNull(),
    version: integer('version').notNull().default(1),
    archivedAt: timestamp('archived_at'),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('expenses_trip_idx').on(t.tripId),
    index('expenses_paid_by_idx').on(t.paidByUserId),
  ],
);

export const expenseParticipants = pgTable(
  'expense_participants',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    expenseId: text('expense_id')
      .notNull()
      .references(() => expenses.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id),
    shareAmount: numeric('share_amount', { precision: 12, scale: 2 }).notNull(),
  },
  (t) => [index('expense_participants_expense_idx').on(t.expenseId)],
);

export const settlements = pgTable(
  'settlements',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    fromUserId: text('from_user_id')
      .notNull()
      .references(() => user.id),
    toUserId: text('to_user_id')
      .notNull()
      .references(() => user.id),
    amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('settlements_trip_idx').on(t.tripId)],
);

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  trip: one(trips, { fields: [expenses.tripId], references: [trips.id] }),
  paidBy: one(user, {
    fields: [expenses.paidByUserId],
    references: [user.id],
    relationName: 'paidByUser',
  }),
  createdBy: one(user, {
    fields: [expenses.createdByUserId],
    references: [user.id],
    relationName: 'createdByUser',
  }),
  participants: many(expenseParticipants),
}));

export const expenseParticipantsRelations = relations(
  expenseParticipants,
  ({ one }) => ({
    expense: one(expenses, {
      fields: [expenseParticipants.expenseId],
      references: [expenses.id],
    }),
    user: one(user, {
      fields: [expenseParticipants.userId],
      references: [user.id],
    }),
  }),
);

export const settlementsRelations = relations(settlements, ({ one }) => ({
  trip: one(trips, { fields: [settlements.tripId], references: [trips.id] }),
  fromUser: one(user, {
    fields: [settlements.fromUserId],
    references: [user.id],
    relationName: 'settlementFrom',
  }),
  toUser: one(user, {
    fields: [settlements.toUserId],
    references: [user.id],
    relationName: 'settlementTo',
  }),
}));
