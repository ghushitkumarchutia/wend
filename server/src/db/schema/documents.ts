import { pgTable, text, timestamp, integer, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth.js';
import { trips } from './trips.js';

export const tripDocuments = pgTable(
  'trip_documents',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    tripId: text('trip_id')
      .notNull()
      .references(() => trips.id, { onDelete: 'cascade' }),
    uploadedByUserId: text('uploaded_by_user_id')
      .notNull()
      .references(() => user.id),
    fileName: text('file_name').notNull(),
    fileType: text('file_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    storageKey: text('storage_key').notNull().unique(),
    category: text('category', {
      enum: ['flight', 'hotel', 'visa', 'insurance', 'booking', 'other'],
    }),
    visibility: text('visibility', { enum: ['shared', 'private'] })
      .notNull()
      .default('shared'),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('trip_documents_trip_idx').on(t.tripId),
    index('trip_documents_uploader_idx').on(t.uploadedByUserId),
  ],
);

export const tripDocumentsRelations = relations(tripDocuments, ({ one }) => ({
  trip: one(trips, {
    fields: [tripDocuments.tripId],
    references: [trips.id],
  }),
  uploadedBy: one(user, {
    fields: [tripDocuments.uploadedByUserId],
    references: [user.id],
  }),
}));
