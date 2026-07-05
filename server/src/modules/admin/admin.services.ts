import { db } from '../../common/db.js';
import { getPresignedPutUrl } from '../../common/storage.js';
import { templates, templateDays, templateEvents, templateAuditLog } from '../../db/index.js';
import { eq, asc, sql } from 'drizzle-orm';

export async function listAllTemplates(page: number, pageSize: number) {
  const [countResult] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(templates);

  const total = countResult?.total ?? 0;
  const offset = (page - 1) * pageSize;

  const rows = await db.query.templates.findMany({
    orderBy: [asc(templates.createdAt)],
    limit: pageSize,
    offset,
  });

  return {
    data: rows.map((r) => ({
      id: r.id,
      title: r.title,
      destination: r.destination,
      visibility: r.visibility,
      cloneCount: r.cloneCount,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTemplateStats() {
  const [total] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(templates);

  const [published] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(templates)
    .where(eq(templates.visibility, 'published'));

  const [featured] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(templates)
    .where(eq(templates.visibility, 'featured'));

  const [clones] = await db
    .select({ total: sql<number>`coalesce(sum(${templates.cloneCount}), 0)::int` })
    .from(templates);

  return {
    total: total?.count ?? 0,
    published: published?.count ?? 0,
    featured: featured?.count ?? 0,
    totalClones: clones?.total ?? 0,
  };
}

export async function getTemplateById(templateId: string) {
  const row = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
    with: {
      days: {
        orderBy: [asc(templateDays.order)],
        with: {
          events: {
            orderBy: [asc(templateEvents.order)],
          },
        },
      },
    },
  });

  if (!row) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return row;
}

export async function createTemplate(
  adminUserId: string,
  data: {
    title: string;
    destination: string;
    description: string;
    coverImageUrl?: string;
    visibility?: string;
    categories: string[];
    recommendedGroupSizeMin?: number;
    recommendedGroupSizeMax?: number;
    bestSeason?: string[];
    difficultyLevel?: string;
    estimatedBudgetBreakdown?: Record<string, number>;
    estimatedBudgetCurrency?: string;
  },
) {
  const [template] = await db
    .insert(templates)
    .values({
      title: data.title,
      destination: data.destination,
      description: data.description,
      coverImageUrl: data.coverImageUrl ?? null,
      visibility: (data.visibility ?? 'draft') as typeof templates.$inferInsert.visibility,
      categories: data.categories,
      recommendedGroupSizeMin: data.recommendedGroupSizeMin ?? null,
      recommendedGroupSizeMax: data.recommendedGroupSizeMax ?? null,
      bestSeason: data.bestSeason ?? null,
      difficultyLevel: (data.difficultyLevel ?? null) as typeof templates.$inferInsert.difficultyLevel,
      estimatedBudgetBreakdown: data.estimatedBudgetBreakdown ?? null,
      estimatedBudgetCurrency: data.estimatedBudgetCurrency ?? null,
      createdByUserId: adminUserId,
    })
    .returning();

  await db.insert(templateAuditLog).values({
    templateId: template.id,
    adminUserId,
    action: 'created',
  });

  return template;
}

export async function updateTemplate(
  templateId: string,
  adminUserId: string,
  data: Record<string, unknown>,
) {
  const values: Record<string, unknown> = { updatedAt: new Date() };

  if (data.title !== undefined) values.title = data.title;
  if (data.destination !== undefined) values.destination = data.destination;
  if (data.description !== undefined) values.description = data.description;
  if (data.coverImageUrl !== undefined) values.coverImageUrl = data.coverImageUrl;
  if (data.visibility !== undefined) values.visibility = data.visibility;
  if (data.categories !== undefined) values.categories = data.categories;
  if (data.recommendedGroupSizeMin !== undefined) values.recommendedGroupSizeMin = data.recommendedGroupSizeMin;
  if (data.recommendedGroupSizeMax !== undefined) values.recommendedGroupSizeMax = data.recommendedGroupSizeMax;
  if (data.bestSeason !== undefined) values.bestSeason = data.bestSeason;
  if (data.difficultyLevel !== undefined) values.difficultyLevel = data.difficultyLevel;
  if (data.estimatedBudgetBreakdown !== undefined) values.estimatedBudgetBreakdown = data.estimatedBudgetBreakdown;
  if (data.estimatedBudgetCurrency !== undefined) values.estimatedBudgetCurrency = data.estimatedBudgetCurrency;

  const [updated] = await db
    .update(templates)
    .set(values)
    .where(eq(templates.id, templateId))
    .returning();

  if (!updated) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  await db.insert(templateAuditLog).values({
    templateId,
    adminUserId,
    action: 'updated',
  });

  return updated;
}

export async function changeTemplateVisibility(
  templateId: string,
  adminUserId: string,
  visibility: string,
): Promise<void> {
  const [updated] = await db
    .update(templates)
    .set({
      visibility: visibility as typeof templates.$inferInsert.visibility,
      updatedAt: new Date(),
    })
    .where(eq(templates.id, templateId))
    .returning({ id: templates.id });

  if (!updated) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  await db.insert(templateAuditLog).values({
    templateId,
    adminUserId,
    action: 'visibility_changed',
    metadata: { visibility },
  });
}

export async function duplicateTemplate(templateId: string, adminUserId: string) {
  const original = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
    with: {
      days: {
        orderBy: [asc(templateDays.order)],
        with: {
          events: {
            orderBy: [asc(templateEvents.order)],
          },
        },
      },
    },
  });

  if (!original) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const [duplicate] = await db
    .insert(templates)
    .values({
      title: `${original.title} (Copy)`,
      destination: original.destination,
      description: original.description,
      coverImageUrl: original.coverImageUrl,
      visibility: 'draft',
      categories: original.categories as string[],
      recommendedGroupSizeMin: original.recommendedGroupSizeMin,
      recommendedGroupSizeMax: original.recommendedGroupSizeMax,
      bestSeason: original.bestSeason as string[] | null,
      difficultyLevel: original.difficultyLevel as typeof templates.$inferInsert.difficultyLevel,
      estimatedBudgetBreakdown: original.estimatedBudgetBreakdown as Record<string, number> | null,
      estimatedBudgetCurrency: original.estimatedBudgetCurrency,
      createdByUserId: adminUserId,
    })
    .returning();

  for (const day of original.days) {
    const [newDay] = await db
      .insert(templateDays)
      .values({
        templateId: duplicate.id,
        dayNumber: day.dayNumber,
        order: day.order,
      })
      .returning();

    for (const event of day.events) {
      await db.insert(templateEvents).values({
        dayId: newDay.id,
        title: event.title,
        time: event.time,
        location: event.location,
        description: event.description,
        order: event.order,
      });
    }
  }

  await db.insert(templateAuditLog).values({
    templateId: duplicate.id,
    adminUserId,
    action: 'duplicated',
    metadata: { sourceTemplateId: templateId },
  });

  return duplicate;
}

export async function deleteTemplate(templateId: string, adminUserId: string): Promise<void> {
  await db.insert(templateAuditLog).values({
    templateId,
    adminUserId,
    action: 'deleted',
  });

  const [deleted] = await db
    .delete(templates)
    .where(eq(templates.id, templateId))
    .returning({ id: templates.id });

  if (!deleted) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function addDay(
  templateId: string,
  data: { dayNumber: number },
) {
  const [day] = await db
    .insert(templateDays)
    .values({
      templateId,
      dayNumber: data.dayNumber,
      order: data.dayNumber,
    })
    .returning();

  return day;
}

export async function editDay(dayId: string, data: Record<string, unknown>) {
  const values: Record<string, unknown> = {};
  if (data.dayNumber !== undefined) values.dayNumber = data.dayNumber;
  if (data.order !== undefined) values.order = data.order;

  const [updated] = await db
    .update(templateDays)
    .set(values)
    .where(eq(templateDays.id, dayId))
    .returning();

  if (!updated) {
    const err = new Error('Day not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return updated;
}

export async function removeDay(dayId: string): Promise<void> {
  const [deleted] = await db
    .delete(templateDays)
    .where(eq(templateDays.id, dayId))
    .returning({ id: templateDays.id });

  if (!deleted) {
    const err = new Error('Day not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function addEvent(
  dayId: string,
  data: { title: string; time?: string; location?: string; description?: string; order: number },
) {
  const [event] = await db
    .insert(templateEvents)
    .values({
      dayId,
      title: data.title,
      time: data.time ?? null,
      location: data.location ?? null,
      description: data.description ?? null,
      order: data.order,
    })
    .returning();

  return event;
}

export async function editEvent(eventId: string, data: Record<string, unknown>) {
  const values: Record<string, unknown> = {};
  if (data.title !== undefined) values.title = data.title;
  if (data.time !== undefined) values.time = data.time;
  if (data.location !== undefined) values.location = data.location;
  if (data.description !== undefined) values.description = data.description;
  if (data.order !== undefined) values.order = data.order;

  const [updated] = await db
    .update(templateEvents)
    .set(values)
    .where(eq(templateEvents.id, eventId))
    .returning();

  if (!updated) {
    const err = new Error('Event not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return updated;
}

export async function removeEvent(eventId: string): Promise<void> {
  const [deleted] = await db
    .delete(templateEvents)
    .where(eq(templateEvents.id, eventId))
    .returning({ id: templateEvents.id });

  if (!deleted) {
    const err = new Error('Event not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
}

export async function reorderItems(
  items: Array<{ id: string; order: number }>,
): Promise<void> {
  for (const item of items) {
    await db.update(templateDays).set({ order: item.order }).where(eq(templateDays.id, item.id));
    await db.update(templateEvents).set({ order: item.order }).where(eq(templateEvents.id, item.id));
  }
}

export async function generateCoverImageUrl(templateId: string) {
  const template = await db.query.templates.findFirst({
    where: eq(templates.id, templateId),
    columns: { id: true },
  });

  if (!template) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  const key = `templates/${templateId}/cover-${Date.now()}`;
  const uploadUrl = await getPresignedPutUrl(key, 'image/webp');
  return { uploadUrl, storageKey: key };
}
