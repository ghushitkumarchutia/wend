import { db } from '../../common/db.js';
import { getPresignedPutUrl } from '../../common/storage.js';
import { templates, templateDays, templateEvents, templateFlightDetails, templateAuditLog } from '../../db/index.js';
import { eq, asc, sql } from 'drizzle-orm';

export async function listAllTemplates(page: number, pageSize: number) {
  const [countResult] = await db.select({ total: sql<number>`count(*)::int` }).from(templates);

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
  const [total] = await db.select({ count: sql<number>`count(*)::int` }).from(templates);

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
  return await db.transaction(async (tx) => {
    const [template] = await tx
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
        difficultyLevel: (data.difficultyLevel ??
          null) as typeof templates.$inferInsert.difficultyLevel,
        estimatedBudgetBreakdown: data.estimatedBudgetBreakdown ?? null,
        estimatedBudgetCurrency: data.estimatedBudgetCurrency ?? null,
        createdByUserId: adminUserId,
      })
      .returning();

    await tx.insert(templateAuditLog).values({
      templateId: template.id,
      adminUserId,
      action: 'created',
    });

    return template;
  });
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
  if (data.recommendedGroupSizeMin !== undefined)
    values.recommendedGroupSizeMin = data.recommendedGroupSizeMin;
  if (data.recommendedGroupSizeMax !== undefined)
    values.recommendedGroupSizeMax = data.recommendedGroupSizeMax;
  if (data.bestSeason !== undefined) values.bestSeason = data.bestSeason;
  if (data.difficultyLevel !== undefined) values.difficultyLevel = data.difficultyLevel;
  if (data.estimatedBudgetBreakdown !== undefined)
    values.estimatedBudgetBreakdown = data.estimatedBudgetBreakdown;
  if (data.estimatedBudgetCurrency !== undefined)
    values.estimatedBudgetCurrency = data.estimatedBudgetCurrency;

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(templates)
      .set(values)
      .where(eq(templates.id, templateId))
      .returning();

    if (!updated) {
      const err = new Error('Template not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    await tx.insert(templateAuditLog).values({
      templateId,
      adminUserId,
      action: 'updated',
    });

    return updated;
  });
}

export async function changeTemplateVisibility(
  templateId: string,
  adminUserId: string,
  visibility: string,
): Promise<void> {
  await db.transaction(async (tx) => {
    const [updated] = await tx
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

    await tx.insert(templateAuditLog).values({
      templateId,
      adminUserId,
      action: 'visibility_changed',
      metadata: { visibility },
    });
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
            with: { flightDetails: true },
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

  return await db.transaction(async (tx) => {
    const [duplicate] = await tx
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
      const [newDay] = await tx
        .insert(templateDays)
        .values({
          templateId: duplicate.id,
          dayNumber: day.dayNumber,
          order: day.order,
        })
        .returning();

      for (const event of day.events) {
        const [newEvent] = await tx.insert(templateEvents).values({
          dayId: newDay.id,
          title: event.title,
          category: event.category,
          status: event.status,
          time: event.time,
          location: event.location,
          description: event.description,
          order: event.order,
        }).returning();

        if (event.flightDetails) {
          await tx.insert(templateFlightDetails).values({
            eventId: newEvent.id,
            airline: event.flightDetails.airline,
            flightNumber: event.flightDetails.flightNumber,
            departureAirport: event.flightDetails.departureAirport,
            arrivalAirport: event.flightDetails.arrivalAirport,
            confirmationRef: event.flightDetails.confirmationRef,
            terminal: event.flightDetails.terminal,
            gate: event.flightDetails.gate,
            seat: event.flightDetails.seat,
            baggageAllowance: event.flightDetails.baggageAllowance,
          });
        }
      }
    }

    await tx.insert(templateAuditLog).values({
      templateId: duplicate.id,
      adminUserId,
      action: 'duplicated',
      metadata: { sourceTemplateId: templateId },
    });

    return duplicate;
  });
}

export async function deleteTemplate(templateId: string, adminUserId: string): Promise<void> {
  await db.transaction(async (tx) => {
    const existing = await tx.query.templates.findFirst({
      where: eq(templates.id, templateId),
      columns: { id: true },
    });

    if (!existing) {
      const err = new Error('Template not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    await tx.insert(templateAuditLog).values({
      templateId,
      adminUserId,
      action: 'deleted',
    });

    await tx.delete(templates).where(eq(templates.id, templateId));
  });
}

export async function addDay(templateId: string, data: { dayNumber: number }) {
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
  data: {
    title: string;
    category?: string;
    status?: string;
    time?: string;
    location?: string;
    description?: string;
    order: number;
    flightDetails?: Record<string, string | undefined>;
  },
) {
  return await db.transaction(async (tx) => {
    const [event] = await tx
      .insert(templateEvents)
      .values({
        dayId,
        title: data.title,
        category: (data.category ?? 'activity') as typeof templateEvents.$inferInsert.category,
        status: (data.status ?? 'confirmed') as typeof templateEvents.$inferInsert.status,
        time: data.time ?? null,
        location: data.location ?? null,
        description: data.description ?? null,
        order: data.order,
      })
      .returning();

    if (data.flightDetails && (data.category === 'flight' || !data.category)) {
      await tx.insert(templateFlightDetails).values({
        eventId: event.id,
        airline: data.flightDetails.airline ?? null,
        flightNumber: data.flightDetails.flightNumber ?? null,
        departureAirport: data.flightDetails.departureAirport ?? null,
        arrivalAirport: data.flightDetails.arrivalAirport ?? null,
        confirmationRef: data.flightDetails.confirmationRef ?? null,
        terminal: data.flightDetails.terminal ?? null,
        gate: data.flightDetails.gate ?? null,
        seat: data.flightDetails.seat ?? null,
        baggageAllowance: data.flightDetails.baggageAllowance ?? null,
      });
    }

    return event;
  });
}

export async function editEvent(eventId: string, data: Record<string, unknown>) {
  const existing = await db.query.templateEvents.findFirst({
    where: eq(templateEvents.id, eventId),
  });

  if (!existing) {
    const err = new Error('Event not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (data.version !== undefined && existing.version !== (data.version as number)) {
    const err = new Error('Version conflict — reload and try again') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const values: Record<string, unknown> = {
    version: existing.version + 1,
  };

  if (data.title !== undefined) values.title = data.title;
  if (data.category !== undefined) values.category = data.category;
  if (data.status !== undefined) values.status = data.status;
  if (data.time !== undefined) values.time = data.time;
  if (data.location !== undefined) values.location = data.location;
  if (data.description !== undefined) values.description = data.description;
  if (data.order !== undefined) values.order = data.order;

  return await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(templateEvents)
      .set(values)
      .where(eq(templateEvents.id, eventId))
      .returning();

    if (data.flightDetails !== undefined) {
      await tx.delete(templateFlightDetails).where(eq(templateFlightDetails.eventId, eventId));

      if (data.flightDetails !== null) {
        const fd = data.flightDetails as Record<string, string | undefined>;
        await tx.insert(templateFlightDetails).values({
          eventId,
          airline: fd.airline ?? null,
          flightNumber: fd.flightNumber ?? null,
          departureAirport: fd.departureAirport ?? null,
          arrivalAirport: fd.arrivalAirport ?? null,
          confirmationRef: fd.confirmationRef ?? null,
          terminal: fd.terminal ?? null,
          gate: fd.gate ?? null,
          seat: fd.seat ?? null,
          baggageAllowance: fd.baggageAllowance ?? null,
        });
      }
    }

    return updated;
  });
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

export async function reorderItems(items: Array<{ id: string; order: number }>): Promise<void> {
  await db.transaction(async (tx) => {
    for (const item of items) {
      await tx.update(templateDays).set({ order: item.order }).where(eq(templateDays.id, item.id));
      await tx
        .update(templateEvents)
        .set({ order: item.order })
        .where(eq(templateEvents.id, item.id));
    }
  });
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
