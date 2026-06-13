import {
  pgTable,
  text,
  timestamp,
  integer,
  doublePrecision,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { user } from './auth';

export const templates = pgTable(
  'templates',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text('title').notNull(),
    destination: text('destination').notNull(),
    description: text('description').notNull(),
    coverImageUrl: text('cover_image_url'),
    visibility: text('visibility', {
      enum: ['draft', 'published', 'featured', 'hidden'],
    })
      .notNull()
      .default('draft'),
    categories: jsonb('categories').$type<string[]>().notNull().default([]),
    recommendedGroupSizeMin: integer('recommended_group_size_min'),
    recommendedGroupSizeMax: integer('recommended_group_size_max'),
    bestSeason: jsonb('best_season').$type<string[]>(),
    difficultyLevel: text('difficulty_level', {
      enum: ['easy', 'moderate', 'challenging'],
    }),
    estimatedBudgetBreakdown: jsonb('estimated_budget_breakdown').$type<
      Record<string, number>
    >(),
    estimatedBudgetCurrency: text('estimated_budget_currency'),
    cloneCount: integer('clone_count').notNull().default(0),
    createdByUserId: text('created_by_user_id')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    index('templates_visibility_idx').on(t.visibility),
  ],
);

export const templateDays = pgTable(
  'template_days',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    templateId: text('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    dayNumber: integer('day_number').notNull(),
    order: doublePrecision('order').notNull().default(0),
  },
  (t) => [index('template_days_template_idx').on(t.templateId)],
);

export const templateEvents = pgTable(
  'template_events',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    dayId: text('day_id')
      .notNull()
      .references(() => templateDays.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    time: text('time'),
    location: text('location'),
    description: text('description'),
    order: doublePrecision('order').notNull().default(0),
  },
  (t) => [index('template_events_day_idx').on(t.dayId)],
);

export const templateAuditLog = pgTable(
  'template_audit_log',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    templateId: text('template_id')
      .notNull()
      .references(() => templates.id, { onDelete: 'cascade' }),
    adminUserId: text('admin_user_id')
      .notNull()
      .references(() => user.id),
    action: text('action').notNull(),
    previousVisibility: text('previous_visibility'),
    newVisibility: text('new_visibility'),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (t) => [index('template_audit_log_template_idx').on(t.templateId)],
);

export const templatesRelations = relations(templates, ({ one, many }) => ({
  createdBy: one(user, {
    fields: [templates.createdByUserId],
    references: [user.id],
  }),
  days: many(templateDays),
  auditLogs: many(templateAuditLog),
}));

export const templateDaysRelations = relations(
  templateDays,
  ({ one, many }) => ({
    template: one(templates, {
      fields: [templateDays.templateId],
      references: [templates.id],
    }),
    events: many(templateEvents),
  }),
);

export const templateEventsRelations = relations(
  templateEvents,
  ({ one }) => ({
    day: one(templateDays, {
      fields: [templateEvents.dayId],
      references: [templateDays.id],
    }),
  }),
);

export const templateAuditLogRelations = relations(
  templateAuditLog,
  ({ one }) => ({
    template: one(templates, {
      fields: [templateAuditLog.templateId],
      references: [templates.id],
    }),
    admin: one(user, {
      fields: [templateAuditLog.adminUserId],
      references: [user.id],
    }),
  }),
);
