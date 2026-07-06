import { db } from '../../common/db.js';
import {
  expenses,
  expenseParticipants,
  settlements,
  tripMembers,
  trips,
  activityLog,
  user,
} from '../../db/index.js';
import { eq, and, desc, isNull, sql, sum } from 'drizzle-orm';
import { notificationsQueue } from '../../common/queues.js';
import type { BalanceEntry, SettlementSuggestion, BudgetOverview } from '../../shared/types.js';

export async function listExpenses(tripId: string) {
  const rows = await db.query.expenses.findMany({
    where: and(eq(expenses.tripId, tripId), isNull(expenses.archivedAt)),
    orderBy: [desc(expenses.incurredAt)],
    with: {
      participants: {
        with: { user: { columns: { name: true } } },
      },
      paidBy: { columns: { name: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    tripId: r.tripId,
    description: r.description,
    category: r.category,
    amount: r.amount,
    currency: r.currency,
    paidByUserId: r.paidByUserId,
    paidByUserName: r.paidBy.name,
    splitMethod: r.splitMethod,
    receiptUrl: r.receiptUrl,
    incurredAt: r.incurredAt.toISOString(),
    version: r.version,
    createdByUserId: r.createdByUserId,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    participants: r.participants.map((p) => ({
      userId: p.userId,
      userName: p.user.name,
      shareAmount: p.shareAmount,
    })),
  }));
}

export async function getExpenseById(tripId: string, expenseId: string) {
  const row = await db.query.expenses.findFirst({
    where: and(
      eq(expenses.id, expenseId),
      eq(expenses.tripId, tripId),
      isNull(expenses.archivedAt),
    ),
    with: {
      participants: {
        with: { user: { columns: { name: true } } },
      },
      paidBy: { columns: { name: true } },
    },
  });

  if (!row) {
    const err = new Error('Expense not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  return {
    id: row.id,
    tripId: row.tripId,
    description: row.description,
    category: row.category,
    amount: row.amount,
    currency: row.currency,
    paidByUserId: row.paidByUserId,
    paidByUserName: row.paidBy.name,
    splitMethod: row.splitMethod,
    receiptUrl: row.receiptUrl,
    incurredAt: row.incurredAt.toISOString(),
    version: row.version,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    participants: row.participants.map((p) => ({
      userId: p.userId,
      userName: p.user.name,
      shareAmount: p.shareAmount,
    })),
  };
}

export async function createExpense(
  tripId: string,
  userId: string,
  data: {
    description: string;
    amount: number;
    category: string;
    paidByUserId: string;
    splitMethod?: string;
    incurredAt: string;
    participants: Array<{ userId: string; shareAmount: number }>;
    receiptUrl?: string;
  },
) {
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { baseCurrency: true, name: true },
  });

  const expense = await db.transaction(async (tx) => {
    const [exp] = await tx
      .insert(expenses)
      .values({
        tripId,
        description: data.description,
        amount: data.amount.toString(),
        currency: trip?.baseCurrency ?? 'USD',
        category: data.category as typeof expenses.$inferInsert.category,
        paidByUserId: data.paidByUserId,
        splitMethod: (data.splitMethod ?? 'equal') as typeof expenses.$inferInsert.splitMethod,
        incurredAt: new Date(data.incurredAt),
        receiptUrl: data.receiptUrl ?? null,
        createdByUserId: userId,
      })
      .returning();

    if (data.participants.length > 0) {
      await tx.insert(expenseParticipants).values(
        data.participants.map((p) => ({
          expenseId: exp.id,
          userId: p.userId,
          shareAmount: p.shareAmount.toString(),
        })),
      );
    }

    await tx.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'expense_added',
      referenceId: exp.id,
      referenceType: 'expense',
    });

    return exp;
  });

  const actor = await db.query.user.findFirst({ where: eq(user.id, userId), columns: { name: true } });

  await notificationsQueue.add('expense_added', {
    type: 'expense_added',
    tripId,
    tripName: trip?.name ?? '',
    actorUserId: userId,
    actorName: actor?.name ?? 'Someone',
    referenceId: expense.id,
    referenceType: 'expense',
  });

  return expense;
}

export async function updateExpense(
  tripId: string,
  expenseId: string,
  userId: string,
  data: Record<string, unknown>,
) {
  const existing = await db.query.expenses.findFirst({
    where: and(
      eq(expenses.id, expenseId),
      eq(expenses.tripId, tripId),
      isNull(expenses.archivedAt),
    ),
  });

  if (!existing) {
    const err = new Error('Expense not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  if (existing.version !== (data.version as number)) {
    const err = new Error('Version conflict — reload and try again') as Error & { status: number };
    err.status = 409;
    throw err;
  }

  const values: Record<string, unknown> = {
    version: existing.version + 1,
    updatedAt: new Date(),
  };

  if (data.description !== undefined) values.description = data.description;
  if (data.amount !== undefined) values.amount = String(data.amount);
  if (data.category !== undefined) values.category = data.category;
  if (data.paidByUserId !== undefined) values.paidByUserId = data.paidByUserId;
  if (data.splitMethod !== undefined) values.splitMethod = data.splitMethod;
  if (data.incurredAt !== undefined) values.incurredAt = new Date(data.incurredAt as string);
  if (data.receiptUrl !== undefined) values.receiptUrl = data.receiptUrl;

  const updated = await db.transaction(async (tx) => {
    const [upd] = await tx
      .update(expenses)
      .set(values)
      .where(eq(expenses.id, expenseId))
      .returning();

    if (data.participants !== undefined) {
      await tx.delete(expenseParticipants).where(eq(expenseParticipants.expenseId, expenseId));

      const participants = data.participants as Array<{ userId: string; shareAmount: number }>;
      if (participants.length > 0) {
        await tx.insert(expenseParticipants).values(
          participants.map((p) => ({
            expenseId,
            userId: p.userId,
            shareAmount: p.shareAmount.toString(),
          })),
        );
      }
    }

    await tx.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'expense_updated',
      referenceId: expenseId,
      referenceType: 'expense',
    });

    return upd;
  });

  const trip = await db.query.trips.findFirst({ where: eq(trips.id, tripId), columns: { name: true } });
  const actor = await db.query.user.findFirst({ where: eq(user.id, userId), columns: { name: true } });

  await notificationsQueue.add('expense_updated', {
    type: 'expense_updated',
    tripId,
    tripName: trip?.name ?? '',
    actorUserId: userId,
    actorName: actor?.name ?? 'Someone',
    referenceId: expenseId,
    referenceType: 'expense',
  });

  return updated;
}

export async function softDeleteExpense(
  tripId: string,
  expenseId: string,
  userId: string,
): Promise<void> {
  const [archived] = await db
    .update(expenses)
    .set({ archivedAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(expenses.id, expenseId), eq(expenses.tripId, tripId), isNull(expenses.archivedAt)),
    )
    .returning({ id: expenses.id });

  if (!archived) {
    const err = new Error('Expense not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }

  await db.insert(activityLog).values({
    tripId,
    actorUserId: userId,
    type: 'expense_deleted',
    referenceId: expenseId,
    referenceType: 'expense',
  });

  const trip = await db.query.trips.findFirst({ where: eq(trips.id, tripId), columns: { name: true } });
  const actor = await db.query.user.findFirst({ where: eq(user.id, userId), columns: { name: true } });

  await notificationsQueue.add('expense_deleted', {
    type: 'expense_deleted',
    tripId,
    tripName: trip?.name ?? '',
    actorUserId: userId,
    actorName: actor?.name ?? 'Someone',
    referenceId: expenseId,
    referenceType: 'expense',
  });
}

export async function computeBalances(tripId: string): Promise<BalanceEntry[]> {
  const members = await db.query.tripMembers.findMany({
    where: eq(tripMembers.tripId, tripId),
    with: { user: { columns: { id: true, name: true, image: true } } },
  });

  const paidTotals = await db
    .select({
      userId: expenses.paidByUserId,
      total: sum(expenses.amount),
    })
    .from(expenses)
    .where(and(eq(expenses.tripId, tripId), isNull(expenses.archivedAt)))
    .groupBy(expenses.paidByUserId);

  const owedTotals = await db
    .select({
      userId: expenseParticipants.userId,
      total: sum(expenseParticipants.shareAmount),
    })
    .from(expenseParticipants)
    .innerJoin(expenses, eq(expenseParticipants.expenseId, expenses.id))
    .where(and(eq(expenses.tripId, tripId), isNull(expenses.archivedAt)))
    .groupBy(expenseParticipants.userId);

  const settlementsPaid = await db
    .select({
      userId: settlements.fromUserId,
      total: sum(settlements.amount),
    })
    .from(settlements)
    .where(eq(settlements.tripId, tripId))
    .groupBy(settlements.fromUserId);

  const settlementsReceived = await db
    .select({
      userId: settlements.toUserId,
      total: sum(settlements.amount),
    })
    .from(settlements)
    .where(eq(settlements.tripId, tripId))
    .groupBy(settlements.toUserId);

  const paidMap = new Map(paidTotals.map((r) => [r.userId, Number(r.total ?? 0)]));
  const owedMap = new Map(owedTotals.map((r) => [r.userId, Number(r.total ?? 0)]));
  const paidSettMap = new Map(settlementsPaid.map((r) => [r.userId, Number(r.total ?? 0)]));
  const recvSettMap = new Map(settlementsReceived.map((r) => [r.userId, Number(r.total ?? 0)]));

  return members.map((m) => {
    const paid = paidMap.get(m.userId) ?? 0;
    const owed = owedMap.get(m.userId) ?? 0;
    const settPaid = paidSettMap.get(m.userId) ?? 0;
    const settRecv = recvSettMap.get(m.userId) ?? 0;
    const balance = paid - owed + settPaid - settRecv;

    return {
      userId: m.user.id,
      userName: m.user.name,
      userImage: m.user.image,
      balance: balance.toFixed(2),
    };
  });
}

export async function computeSettlementSuggestions(
  tripId: string,
): Promise<SettlementSuggestion[]> {
  const balances = await computeBalances(tripId);

  const debtors: Array<{ userId: string; userName: string; amount: number }> = [];
  const creditors: Array<{ userId: string; userName: string; amount: number }> = [];

  for (const b of balances) {
    const amount = Number(b.balance);
    if (amount < -0.01) {
      debtors.push({ userId: b.userId, userName: b.userName, amount: Math.abs(amount) });
    } else if (amount > 0.01) {
      creditors.push({ userId: b.userId, userName: b.userName, amount });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const suggestions: SettlementSuggestion[] = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const settleAmount = Math.min(debtors[i].amount, creditors[j].amount);
    suggestions.push({
      fromUserId: debtors[i].userId,
      fromUserName: debtors[i].userName,
      toUserId: creditors[j].userId,
      toUserName: creditors[j].userName,
      amount: settleAmount.toFixed(2),
    });
    debtors[i].amount -= settleAmount;
    creditors[j].amount -= settleAmount;
    if (debtors[i].amount < 0.01) i++;
    if (creditors[j].amount < 0.01) j++;
  }

  return suggestions;
}

export async function recordSettlement(
  tripId: string,
  actorUserId: string,
  data: { fromUserId: string; toUserId: string; amount: number },
) {
  if (data.fromUserId === data.toUserId) {
    const err = new Error('Cannot settle with yourself') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const fromMember = await db.query.tripMembers.findFirst({
    where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, data.fromUserId)),
    columns: { id: true },
  });

  const toMember = await db.query.tripMembers.findFirst({
    where: and(eq(tripMembers.tripId, tripId), eq(tripMembers.userId, data.toUserId)),
    columns: { id: true },
  });

  if (!fromMember || !toMember) {
    const err = new Error('Both users must be trip members') as Error & { status: number };
    err.status = 400;
    throw err;
  }

  const [settlement] = await db
    .insert(settlements)
    .values({
      tripId,
      fromUserId: data.fromUserId,
      toUserId: data.toUserId,
      amount: data.amount.toString(),
    })
    .returning();

  await db.insert(activityLog).values({
    tripId,
    actorUserId,
    type: 'settlement_recorded',
    referenceId: settlement.id,
    referenceType: 'settlement',
  });

  return settlement;
}

export async function getBudgetOverview(tripId: string): Promise<BudgetOverview> {
  const trip = await db.query.trips.findFirst({
    where: eq(trips.id, tripId),
    columns: { estimatedBudget: true },
  });

  const [result] = await db
    .select({
      totalSpent: sum(expenses.amount),
      expenseCount: sql<number>`count(*)::int`,
    })
    .from(expenses)
    .where(and(eq(expenses.tripId, tripId), isNull(expenses.archivedAt)));

  return {
    totalSpent: Number(result?.totalSpent ?? 0),
    expenseCount: result?.expenseCount ?? 0,
    estimatedBudget: trip?.estimatedBudget ? Number(trip.estimatedBudget) : null,
  };
}
