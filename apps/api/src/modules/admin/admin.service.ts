import { eq, and, sql, asc, count } from 'drizzle-orm';
import { db } from '../../common/db';
import { getPresignedPutUrl } from '../../common/storage';
import { templates, templateDays, templateEvents, templateAuditLog } from '@wend/db';

export const AdminService = {
  async listTemplates(params: {
    q?: string;
    visibility?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const { q, visibility, sort = 'newest', page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (q) {
      const search = `%${q}%`;
      conditions.push(
        sql`(${templates.title} ILIKE ${search} OR ${templates.destination} ILIKE ${search})`,
      );
    }

    if (visibility && ['draft', 'published', 'featured', 'hidden'].includes(visibility)) {
      conditions.push(eq(templates.visibility, visibility as 'draft' | 'published' | 'featured' | 'hidden'));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    let orderBy;
    switch (sort) {
      case 'oldest':
        orderBy = asc(templates.createdAt);
        break;
      case 'most_cloned':
        orderBy = sql`${templates.cloneCount} DESC`;
        break;
      default:
        orderBy = sql`${templates.createdAt} DESC`;
    }

    const rows = await db
      .select()
      .from(templates)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db
      .select({ total: count() })
      .from(templates)
      .where(whereClause);

    return {
      data: rows,
      pagination: {
        page,
        limit,
        total: totalResult?.total ?? 0,
        totalPages: Math.ceil((totalResult?.total ?? 0) / limit),
      },
    };
  },

  async getStats() {
    const [result] = await db
      .select({
        total: count(),
        published: sql<number>`count(*) FILTER (WHERE ${templates.visibility} = 'published')::int`,
        featured: sql<number>`count(*) FILTER (WHERE ${templates.visibility} = 'featured')::int`,
        totalClones: sql<number>`COALESCE(sum(${templates.cloneCount}), 0)::int`,
      })
      .from(templates);

    return {
      total: result?.total ?? 0,
      published: result?.published ?? 0,
      featured: result?.featured ?? 0,
      totalClones: result?.totalClones ?? 0,
    };
  },

  async getTemplate(templateId: string) {
    const [tmpl] = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!tmpl) {
      const err = new Error('Template not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    const days = await db
      .select()
      .from(templateDays)
      .where(eq(templateDays.templateId, templateId))
      .orderBy(asc(templateDays.order));

    const dayIds = days.map((d) => d.id);
    let events: (typeof templateEvents.$inferSelect)[] = [];
    if (dayIds.length > 0) {
      events = await db
        .select()
        .from(templateEvents)
        .where(sql`${templateEvents.dayId} IN ${dayIds}`)
        .orderBy(asc(templateEvents.order));
    }

    return {
      ...tmpl,
      days: days.map((day) => ({
        ...day,
        events: events.filter((e) => e.dayId === day.id),
      })),
    };
  },

  async createTemplate(
    adminUserId: string,
    data: Record<string, unknown>,
  ) {
    const [tmpl] = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(templates)
        .values({
          title: data.title as string,
          destination: data.destination as string,
          description: data.description as string,
          coverImageUrl: (data.coverImageUrl as string) ?? null,
          visibility: (data.visibility as string) ?? 'draft',
          categories: (data.categories as string[]) ?? [],
          recommendedGroupSizeMin: (data.recommendedGroupSizeMin as number) ?? null,
          recommendedGroupSizeMax: (data.recommendedGroupSizeMax as number) ?? null,
          bestSeason: (data.bestSeason as string[]) ?? null,
          difficultyLevel: (data.difficultyLevel as string) ?? null,
          estimatedBudgetBreakdown: (data.estimatedBudgetBreakdown as Record<string, number>) ?? null,
          estimatedBudgetCurrency: (data.estimatedBudgetCurrency as string) ?? null,
          createdByUserId: adminUserId,
        } as typeof templates.$inferInsert)
        .returning();

      await tx.insert(templateAuditLog).values({
        templateId: created!.id,
        adminUserId,
        action: 'created',
        newVisibility: (data.visibility as string) ?? 'draft',
      });

      return [created!];
    });

    return tmpl;
  },

  async updateTemplate(
    templateId: string,
    adminUserId: string,
    data: Record<string, unknown>,
  ) {
    const [existing] = await db
      .select({ id: templates.id, visibility: templates.visibility })
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!existing) {
      const err = new Error('Template not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    const fields = [
      'title', 'destination', 'description', 'coverImageUrl',
      'categories', 'recommendedGroupSizeMin', 'recommendedGroupSizeMax',
      'bestSeason', 'difficultyLevel', 'estimatedBudgetBreakdown',
      'estimatedBudgetCurrency', 'visibility',
    ] as const;

    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const [updated] = await db.transaction(async (tx) => {
      const [result] = await tx
        .update(templates)
        .set(updateData)
        .where(eq(templates.id, templateId))
        .returning();

      await tx.insert(templateAuditLog).values({
        templateId,
        adminUserId,
        action: 'edited',
        previousVisibility: existing.visibility,
        newVisibility: (data.visibility as string) ?? existing.visibility,
      });

      return [result!];
    });

    return updated;
  },

  async changeVisibility(
    templateId: string,
    adminUserId: string,
    visibility: string,
  ) {
    const [existing] = await db
      .select({ id: templates.id, visibility: templates.visibility })
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!existing) {
      const err = new Error('Template not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    const [updated] = await db.transaction(async (tx) => {
      const [result] = await tx
        .update(templates)
        .set({ visibility: visibility as 'draft' | 'published' | 'featured' | 'hidden', updatedAt: new Date() })
        .where(eq(templates.id, templateId))
        .returning();

      await tx.insert(templateAuditLog).values({
        templateId,
        adminUserId,
        action: 'visibility_changed',
        previousVisibility: existing.visibility,
        newVisibility: visibility,
      });

      return [result!];
    });

    return updated;
  },

  async duplicateTemplate(templateId: string, adminUserId: string) {
    const source = await this.getTemplate(templateId);

    const [duplicate] = await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(templates)
        .values({
          title: `${source.title} (copy)`,
          destination: source.destination,
          description: source.description,
          coverImageUrl: source.coverImageUrl,
          visibility: 'draft',
          categories: source.categories,
          recommendedGroupSizeMin: source.recommendedGroupSizeMin,
          recommendedGroupSizeMax: source.recommendedGroupSizeMax,
          bestSeason: source.bestSeason,
          difficultyLevel: source.difficultyLevel,
          estimatedBudgetBreakdown: source.estimatedBudgetBreakdown,
          estimatedBudgetCurrency: source.estimatedBudgetCurrency,
          createdByUserId: adminUserId,
        } as typeof templates.$inferInsert)
        .returning();

      for (const day of source.days) {
        const [newDay] = await tx
          .insert(templateDays)
          .values({
            templateId: created!.id,
            dayNumber: day.dayNumber,
            order: day.order,
          })
          .returning();

        for (const evt of day.events) {
          await tx.insert(templateEvents).values({
            dayId: newDay!.id,
            title: evt.title,
            time: evt.time,
            location: evt.location,
            description: evt.description,
            order: evt.order,
          });
        }
      }

      await tx.insert(templateAuditLog).values({
        templateId: created!.id,
        adminUserId,
        action: 'created',
        newVisibility: 'draft',
        metadata: { duplicatedFrom: templateId },
      });

      return [created!];
    });

    return duplicate;
  },

  async deleteTemplate(templateId: string, adminUserId: string) {
    const [existing] = await db
      .select({ id: templates.id })
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!existing) {
      const err = new Error('Template not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    await db.insert(templateAuditLog).values({
      templateId,
      adminUserId,
      action: 'deleted',
    });

    await db.delete(templates).where(eq(templates.id, templateId));
  },

  async addDay(templateId: string, dayNumber: number) {
    const [existing] = await db
      .select({ id: templates.id })
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);

    if (!existing) {
      const err = new Error('Template not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    const [lastDay] = await db
      .select({ order: templateDays.order })
      .from(templateDays)
      .where(eq(templateDays.templateId, templateId))
      .orderBy(sql`${templateDays.order} DESC`)
      .limit(1);

    const [day] = await db
      .insert(templateDays)
      .values({
        templateId,
        dayNumber,
        order: (lastDay?.order ?? 0) + 1,
      })
      .returning();

    return day;
  },

  async editDay(dayId: string, data: { dayNumber?: number; order?: number }) {
    const updateData: Record<string, unknown> = {};
    if (data.dayNumber !== undefined) updateData.dayNumber = data.dayNumber;
    if (data.order !== undefined) updateData.order = data.order;

    const [updated] = await db
      .update(templateDays)
      .set(updateData)
      .where(eq(templateDays.id, dayId))
      .returning();

    if (!updated) {
      const err = new Error('Day not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    return updated;
  },

  async removeDay(dayId: string) {
    const [existing] = await db
      .select({ id: templateDays.id })
      .from(templateDays)
      .where(eq(templateDays.id, dayId))
      .limit(1);

    if (!existing) {
      const err = new Error('Day not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    await db.delete(templateDays).where(eq(templateDays.id, dayId));
  },

  async addEvent(dayId: string, data: {
    title: string;
    time?: string;
    location?: string;
    description?: string;
    order: number;
  }) {
    const [existing] = await db
      .select({ id: templateDays.id })
      .from(templateDays)
      .where(eq(templateDays.id, dayId))
      .limit(1);

    if (!existing) {
      const err = new Error('Day not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

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
  },

  async editEvent(eventId: string, data: Record<string, unknown>) {
    const updateData: Record<string, unknown> = {};
    const fields = ['title', 'time', 'location', 'description', 'order'] as const;
    for (const field of fields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const [updated] = await db
      .update(templateEvents)
      .set(updateData)
      .where(eq(templateEvents.id, eventId))
      .returning();

    if (!updated) {
      const err = new Error('Event not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    return updated;
  },

  async removeEvent(eventId: string) {
    const [existing] = await db
      .select({ id: templateEvents.id })
      .from(templateEvents)
      .where(eq(templateEvents.id, eventId))
      .limit(1);

    if (!existing) {
      const err = new Error('Event not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    await db.delete(templateEvents).where(eq(templateEvents.id, eventId));
  },

  async reorder(items: Array<{ id: string; order: number }>, table: 'days' | 'events') {
    await db.transaction(async (tx) => {
      for (const item of items) {
        if (table === 'days') {
          await tx
            .update(templateDays)
            .set({ order: item.order })
            .where(eq(templateDays.id, item.id));
        } else {
          await tx
            .update(templateEvents)
            .set({ order: item.order })
            .where(eq(templateEvents.id, item.id));
        }
      }
    });
  },

  async getCoverImageUrl(fileType: string) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(fileType)) {
      const err = new Error('Unsupported image type') as Error & { status: number };
      err.status = 400;
      throw err;
    }

    const ext = fileType.split('/')[1] ?? 'jpg';
    const key = `templates/covers/${crypto.randomUUID()}.${ext}`;
    const url = await getPresignedPutUrl(key, fileType, 900);

    return { url, key };
  },
};
