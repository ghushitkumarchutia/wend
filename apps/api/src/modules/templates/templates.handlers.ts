import type { Request, Response } from 'express';
import { eq, and, sql, inArray, asc } from 'drizzle-orm';
import { db } from '../../common/db';
import { remindersQueue } from '../../common/queues';
import {
  templates,
  templateDays,
  templateEvents,
  trips,
  tripMembers,
  itineraryEvents,
} from '@wend/db';
import type { TripMemberRole } from '@wend/shared';
import { auth } from '../../common/auth';
import { fromNodeHeaders } from 'better-auth/node';

async function getSessionUser(req: Request) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session) {
    const err = new Error('Unauthorized') as Error & { status: number };
    err.status = 401;
    throw err;
  }
  return session.user;
}

export async function listPublished(req: Request, res: Response) {
  const q = (req.query.q as string) ?? '';
  const category = req.query.category as string | undefined;
  const sort = (req.query.sort as string) ?? 'popular';
  const cursor = req.query.cursor as string | undefined;
  const limit = Math.min(Number(req.query.limit) || 20, 50);

  const conditions = [
    sql`${templates.visibility} IN ('published', 'featured')`,
  ];

  if (q) {
    const search = `%${q}%`;
    conditions.push(
      sql`(
        ${templates.title} ILIKE ${search}
        OR ${templates.destination} ILIKE ${search}
        OR ${templates.description} ILIKE ${search}
      )`,
    );
  }

  if (category) {
    conditions.push(
      sql`${templates.categories}::jsonb ? ${category}`,
    );
  }

  let orderBy;
  switch (sort) {
    case 'newest':
      orderBy = sql`${templates.createdAt} DESC`;
      break;
    case 'shortest':
      orderBy = sql`(SELECT count(*) FROM template_days WHERE template_id = ${templates.id}) ASC`;
      break;
    case 'longest':
      orderBy = sql`(SELECT count(*) FROM template_days WHERE template_id = ${templates.id}) DESC`;
      break;
    case 'budget_low':
      orderBy = sql`COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'accommodation')::numeric, 0) +
        COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'transport')::numeric, 0) +
        COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'foodAndDrinks')::numeric, 0) +
        COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'activities')::numeric, 0) +
        COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'miscellaneous')::numeric, 0) ASC`;
      break;
    case 'budget_high':
      orderBy = sql`COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'accommodation')::numeric, 0) +
        COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'transport')::numeric, 0) +
        COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'foodAndDrinks')::numeric, 0) +
        COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'activities')::numeric, 0) +
        COALESCE((${templates.estimatedBudgetBreakdown}::jsonb->>'miscellaneous')::numeric, 0) DESC`;
      break;
    default:
      orderBy = sql`${templates.cloneCount} DESC`;
  }

  if (cursor) {
    conditions.push(sql`${templates.createdAt} < ${new Date(cursor)}`);
  }

  const rows = await db
    .select()
    .from(templates)
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? data[data.length - 1]!.createdAt.toISOString() : null;

  const templateIds = data.map((t) => t.id);
  let days: (typeof templateDays.$inferSelect)[] = [];
  if (templateIds.length > 0) {
    days = await db
      .select()
      .from(templateDays)
      .where(inArray(templateDays.templateId, templateIds))
      .orderBy(asc(templateDays.order));
  }

  const result = data.map((t) => ({
    ...t,
    durationDays: days.filter((d) => d.templateId === t.id).length,
  }));

  res.json({ data: result, nextCursor });
}

export async function getTemplate(req: Request, res: Response) {
  const templateId = req.params.templateId as string;

  const [tmpl] = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, templateId),
        sql`${templates.visibility} IN ('published', 'featured')`,
      ),
    )
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
      .where(inArray(templateEvents.dayId, dayIds))
      .orderBy(asc(templateEvents.order));
  }

  const daysWithEvents = days.map((day) => ({
    ...day,
    events: events.filter((e) => e.dayId === day.id),
  }));

  res.json({
    data: {
      ...tmpl,
      days: daysWithEvents,
    },
  });
}

export async function cloneTemplate(req: Request, res: Response) {
  const sessionUser = await getSessionUser(req);
  const templateId = req.params.templateId as string;

  const [tmpl] = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.id, templateId),
        sql`${templates.visibility} IN ('published', 'featured')`,
      ),
    )
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
  let tmplEvents: (typeof templateEvents.$inferSelect)[] = [];
  if (dayIds.length > 0) {
    tmplEvents = await db
      .select()
      .from(templateEvents)
      .where(inArray(templateEvents.dayId, dayIds))
      .orderBy(asc(templateEvents.order));
  }

  const {
    existingTripId,
    tripName,
    startDate,
    endDate,
    destination,
    baseCurrency,
  } = req.body;

  let tripId: string;

  if (existingTripId) {
    const [membership] = await db
      .select({ role: tripMembers.role })
      .from(tripMembers)
      .where(
        and(
          eq(tripMembers.tripId, existingTripId),
          eq(tripMembers.userId, sessionUser.id),
        ),
      )
      .limit(1);

    if (!membership) {
      const err = new Error('Trip not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    if (membership.role === 'viewer') {
      const err = new Error('Viewers cannot modify trips') as Error & { status: number };
      err.status = 403;
      throw err;
    }

    const [existingTrip] = await db
      .select({ startDate: trips.startDate })
      .from(trips)
      .where(eq(trips.id, existingTripId))
      .limit(1);

    if (!existingTrip) {
      const err = new Error('Trip not found') as Error & { status: number };
      err.status = 404;
      throw err;
    }

    tripId = existingTripId;
    const baseDate = existingTrip.startDate;

    for (const day of days) {
      const dayEvents = tmplEvents.filter((e) => e.dayId === day.id);
      for (const evt of dayEvents) {
        const eventDate = new Date(baseDate);
        eventDate.setDate(eventDate.getDate() + day.dayNumber - 1);

        if (evt.time) {
          const [hours, minutes] = evt.time.split(':').map(Number);
          eventDate.setHours(hours!, minutes ?? 0, 0, 0);
        }

        await db.insert(itineraryEvents).values({
          tripId,
          title: evt.title,
          category: 'activity',
          status: 'confirmed',
          startAt: eventDate,
          location: evt.location,
          notes: evt.description,
          createdByUserId: sessionUser.id,
        } as typeof itineraryEvents.$inferInsert);
      }
    }
  } else {
    const parsedStart = new Date(startDate!);
    const parsedEnd = new Date(endDate!);

    const result = await db.transaction(async (tx) => {
      const [newTrip] = await tx
        .insert(trips)
        .values({
          name: tripName!,
          destination: destination ?? tmpl.destination,
          startDate: parsedStart,
          endDate: parsedEnd,
          baseCurrency: baseCurrency ?? 'USD',
          createdByUserId: sessionUser.id,
        } as typeof trips.$inferInsert)
        .returning();

      await tx.insert(tripMembers).values({
        tripId: newTrip!.id,
        userId: sessionUser.id,
        role: 'organizer' as TripMemberRole,
      } as typeof tripMembers.$inferInsert);

      for (const day of days) {
        const dayEvents = tmplEvents.filter((e) => e.dayId === day.id);
        for (const evt of dayEvents) {
          const eventDate = new Date(parsedStart);
          eventDate.setDate(eventDate.getDate() + day.dayNumber - 1);

          if (evt.time) {
            const [hours, minutes] = evt.time.split(':').map(Number);
            eventDate.setHours(hours!, minutes ?? 0, 0, 0);
          }

          await tx.insert(itineraryEvents).values({
            tripId: newTrip!.id,
            title: evt.title,
            category: 'activity',
            status: 'confirmed',
            startAt: eventDate,
            location: evt.location,
            notes: evt.description,
            createdByUserId: sessionUser.id,
          } as typeof itineraryEvents.$inferInsert);
        }
      }

      return newTrip!;
    });

    tripId = result.id;

    await remindersQueue.add(
      `reminder:trip:${tripId}:1d`,
      { tripId, type: 'departure', daysBefore: 1 },
      {
        delay: Math.max(0, new Date(startDate!).getTime() - 86_400_000 - Date.now()),
        jobId: `reminder:trip:${tripId}:1d`,
      },
    );
  }

  await db
    .update(templates)
    .set({ cloneCount: sql`${templates.cloneCount} + 1` })
    .where(eq(templates.id, templateId));

  res.status(201).json({ data: { tripId } });
}
