import { db } from '../../common/db.js';
import {
  templates,
  templateDays,
  templateEvents,
  trips,
  tripMembers,
  itineraryEvents,
} from '../../db/index.js';
import { eq, sql, asc, or, ilike } from 'drizzle-orm';
import type { TemplateWithDays, PaginatedResponse } from '../../shared/types.js';

export async function listPublishedTemplates(
  page: number,
  pageSize: number,
  search?: string,
  category?: string,
): Promise<PaginatedResponse<Omit<TemplateWithDays, 'days'>>> {
  const conditions = [or(eq(templates.visibility, 'published'), eq(templates.visibility, 'featured'))];

  if (search) {
    conditions.push(
      or(ilike(templates.title, `%${search}%`), ilike(templates.destination, `%${search}%`)),
    );
  }

  if (category) {
    conditions.push(sql`${templates.categories}::jsonb @> ${JSON.stringify([category])}::jsonb`);
  }

  const whereClause = sql`${conditions.reduce((acc, c) => sql`${acc} AND ${c}`)}`;

  const [countResult] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(templates)
    .where(whereClause);

  const total = countResult?.total ?? 0;
  const offset = (page - 1) * pageSize;

  const rows = await db.query.templates.findMany({
    where: whereClause,
    orderBy: [asc(templates.createdAt)],
    limit: pageSize,
    offset,
  });

  const data = rows.map((r) => ({
    id: r.id,
    title: r.title,
    destination: r.destination,
    description: r.description,
    coverImageUrl: r.coverImageUrl,
    categories: r.categories as string[],
    recommendedGroupSizeMin: r.recommendedGroupSizeMin,
    recommendedGroupSizeMax: r.recommendedGroupSizeMax,
    bestSeason: r.bestSeason as string[] | null,
    difficultyLevel: r.difficultyLevel,
    estimatedBudgetBreakdown: r.estimatedBudgetBreakdown as Record<string, number> | null,
    estimatedBudgetCurrency: r.estimatedBudgetCurrency,
    visibility: r.visibility as TemplateWithDays['visibility'],
    cloneCount: r.cloneCount,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  }));

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getTemplateById(templateId: string): Promise<TemplateWithDays> {
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

  if (row.visibility !== 'published' && row.visibility !== 'featured') {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return {
    id: row.id,
    title: row.title,
    destination: row.destination,
    description: row.description,
    coverImageUrl: row.coverImageUrl,
    categories: row.categories as string[],
    recommendedGroupSizeMin: row.recommendedGroupSizeMin,
    recommendedGroupSizeMax: row.recommendedGroupSizeMax,
    bestSeason: row.bestSeason as string[] | null,
    difficultyLevel: row.difficultyLevel,
    estimatedBudgetBreakdown: row.estimatedBudgetBreakdown as Record<string, number> | null,
    estimatedBudgetCurrency: row.estimatedBudgetCurrency,
    visibility: row.visibility as TemplateWithDays['visibility'],
    cloneCount: row.cloneCount,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    days: row.days.map((d) => ({
      id: d.id,
      dayNumber: d.dayNumber,
      order: d.order,
      events: d.events.map((e) => ({
        id: e.id,
        title: e.title,
        time: e.time,
        location: e.location,
        description: e.description,
        order: e.order,
      })),
    })),
  };
}

export async function cloneTemplateToTrip(
  templateId: string,
  userId: string,
  data: {
    existingTripId?: string;
    tripName?: string;
    startDate?: string;
    endDate?: string;
    destination?: string;
    baseCurrency?: string;
  },
) {
  const template = await db.query.templates.findFirst({
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

  if (!template) {
    const err = new Error('Template not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  let tripId: string;

  if (data.existingTripId) {
    tripId = data.existingTripId;
  } else {
    const [newTrip] = await db
      .insert(trips)
      .values({
        name: data.tripName!,
        destination: data.destination ?? template.destination,
        startDate: new Date(data.startDate!),
        endDate: new Date(data.endDate!),
        baseCurrency: data.baseCurrency ?? 'USD',
        createdByUserId: userId,
      })
      .returning();

    await db.insert(tripMembers).values({
      tripId: newTrip.id,
      userId,
      role: 'organizer',
    });

    tripId = newTrip.id;
  }

  const startDate = data.startDate ? new Date(data.startDate) : new Date();

  for (const day of template.days) {
    const eventDate = new Date(startDate);
    eventDate.setDate(eventDate.getDate() + day.dayNumber - 1);

    for (const event of day.events) {
      await db.insert(itineraryEvents).values({
        tripId,
        title: event.title,
        category: 'activity',
        startAt: eventDate,
        location: event.location ?? null,
        notes: event.description ?? null,
        order: event.order,
        createdByUserId: userId,
      });
    }
  }

  await db
    .update(templates)
    .set({ cloneCount: sql`${templates.cloneCount} + 1` })
    .where(eq(templates.id, templateId));

  return { tripId };
}
