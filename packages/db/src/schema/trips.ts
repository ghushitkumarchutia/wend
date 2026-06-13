import {
  pgTable,
  text,
  timestamp,
  numeric,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

export const trips = pgTable('trips', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  destination: text('destination').notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  description: text('description'),
  baseCurrency: text('base_currency').notNull().default('USD'),
  estimatedBudget: numeric('estimated_budget', { precision: 12, scale: 2 }),
  coverImageUrl: text('cover_image_url'),
  archivedAt: timestamp('archived_at'),
  createdByUserId: text('created_by_user_id')
    .notNull()
    .references(() => user.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const tripMembers = pgTable(
  'trip_members',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['organizer', 'member', 'viewer'] })
      .notNull()
      .default('member'),
    joinedAt: timestamp('joined_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('trip_members_trip_user_idx').on(t.tripId, t.userId),
    index('trip_members_user_idx').on(t.userId),
  ],
);

export const tripInvites = pgTable(
  'trip_invites',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    invitedEmail: text('invited_email').notNull(),
    inviterUserId: text('inviter_user_id')
      .notNull()
      .references(() => user.id),
    role: text('role', { enum: ['organizer', 'member', 'viewer'] })
      .notNull()
      .default('member'),
    tokenHash: text('token_hash').notNull().unique(),
    status: text('status', {
      enum: ['pending', 'accepted', 'declined', 'expired', 'revoked'],
    })
      .notNull()
      .default('pending'),
    name: text('name'),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [
    index('trip_invites_trip_email_idx').on(t.tripId, t.invitedEmail),
    index('trip_invites_email_status_idx').on(t.invitedEmail, t.status),
  ],
);

export const tripsRelations = relations(trips, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [trips.createdByUserId],
    references: [user.id],
  }),
  members: many(tripMembers),
  invites: many(tripInvites),
}));

export const tripMembersRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, { fields: [tripMembers.tripId], references: [trips.id] }),
  user: one(user, { fields: [tripMembers.userId], references: [user.id] }),
}));

export const tripInvitesRelations = relations(tripInvites, ({ one }) => ({
  trip: one(trips, { fields: [tripInvites.tripId], references: [trips.id] }),
  inviter: one(user, {
    fields: [tripInvites.inviterUserId],
    references: [user.id],
  }),
}));
