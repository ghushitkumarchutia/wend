import { eq, and, sql, desc } from 'drizzle-orm';
import { db } from '../../common/db';
import { expenses, expenseParticipants, settlements, tripMembers, activityLog } from '@wend/db';

export const LedgerService = {
  async listExpenses(tripId: string) {
    const rows = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.tripId, tripId), sql`${expenses.archivedAt} IS NULL`))
      .orderBy(desc(expenses.incurredAt));

    const expenseIds = rows.map((e) => e.id);
    if (expenseIds.length === 0) return [];

    const participants = await db
      .select()
      .from(expenseParticipants)
      .where(sql`${expenseParticipants.expenseId} IN ${expenseIds}`);

    const participantMap = new Map<string, typeof participants>();
    for (const p of participants) {
      const list = participantMap.get(p.expenseId) ?? [];
      list.push(p);
      participantMap.set(p.expenseId, list);
    }

    return rows.map((expense) => ({
      ...expense,
      participants: participantMap.get(expense.id) ?? [],
    }));
  },

  async getExpense(expenseId: string, tripId: string) {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.id, expenseId),
          eq(expenses.tripId, tripId),
          sql`${expenses.archivedAt} IS NULL`,
        ),
      )
      .limit(1);

    if (!expense) return null;

    const participants = await db
      .select()
      .from(expenseParticipants)
      .where(eq(expenseParticipants.expenseId, expenseId));

    return { ...expense, participants };
  },

  async logExpense(
    tripId: string,
    userId: string,
    data: {
      description: string;
      amount: number;
      category: string;
      paidByUserId: string;
      splitMethod?: string;
      incurredAt: string;
      participants: { userId: string; shareAmount: number }[];
      receiptUrl?: string;
    },
  ) {
    const expense = await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(expenses)
        .values({
          tripId,
          description: data.description,
          amount: data.amount.toString(),
          currency: 'USD',
          category: data.category,
          paidByUserId: data.paidByUserId,
          splitMethod: data.splitMethod ?? 'equal',
          incurredAt: new Date(data.incurredAt),
          receiptUrl: data.receiptUrl ?? null,
          createdByUserId: userId,
        } as typeof expenses.$inferInsert)
        .returning();

      const expenseRow = row!;

      await tx.insert(expenseParticipants).values(
        data.participants.map((p) => ({
          expenseId: expenseRow.id,
          userId: p.userId,
          shareAmount: p.shareAmount.toString(),
        })),
      );

      return expenseRow;
    });

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'expense_added',
      referenceId: expense.id,
      referenceType: 'expense',
    });

    const participants = await db
      .select()
      .from(expenseParticipants)
      .where(eq(expenseParticipants.expenseId, expense.id));

    return { ...expense, participants };
  },

  async updateExpense(
    expenseId: string,
    tripId: string,
    userId: string,
    data: {
      description?: string;
      amount?: number;
      category?: string;
      paidByUserId?: string;
      splitMethod?: string;
      incurredAt?: string;
      participants?: { userId: string; shareAmount: number }[];
      receiptUrl?: string | null;
      version: number;
    },
  ) {
    const updateData: Record<string, unknown> = {
      version: sql`${expenses.version} + 1`,
      updatedAt: new Date(),
    };
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount.toString();
    if (data.category !== undefined) updateData.category = data.category;
    if (data.paidByUserId !== undefined) updateData.paidByUserId = data.paidByUserId;
    if (data.splitMethod !== undefined) updateData.splitMethod = data.splitMethod;
    if (data.incurredAt !== undefined) updateData.incurredAt = new Date(data.incurredAt);
    if (data.receiptUrl !== undefined) updateData.receiptUrl = data.receiptUrl;

    const [updated] = await db
      .update(expenses)
      .set(updateData)
      .where(
        and(
          eq(expenses.id, expenseId),
          eq(expenses.tripId, tripId),
          eq(expenses.version, data.version),
          sql`${expenses.archivedAt} IS NULL`,
        ),
      )
      .returning();

    if (!updated) {
      const [current] = await db
        .select()
        .from(expenses)
        .where(and(eq(expenses.id, expenseId), eq(expenses.tripId, tripId)))
        .limit(1);

      if (!current || current.archivedAt) {
        const err = new Error('Expense not found') as Error & { status: number };
        err.status = 404;
        throw err;
      }

      const err = new Error('Conflict: expense was modified by another user') as Error & {
        status: number;
        current: typeof current;
      };
      err.status = 409;
      err.current = current;
      throw err;
    }

    if (data.participants) {
      await db.transaction(async (tx) => {
        await tx
          .delete(expenseParticipants)
          .where(eq(expenseParticipants.expenseId, expenseId));

        await tx.insert(expenseParticipants).values(
          data.participants!.map((p) => ({
            expenseId,
            userId: p.userId,
            shareAmount: p.shareAmount.toString(),
          })),
        );
      });
    }

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'expense_updated',
      referenceId: expenseId,
      referenceType: 'expense',
    });

    const participants = await db
      .select()
      .from(expenseParticipants)
      .where(eq(expenseParticipants.expenseId, expenseId));

    return { ...updated, participants };
  },

  async deleteExpense(expenseId: string, tripId: string, userId: string) {
    const [archived] = await db
      .update(expenses)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(
        and(
          eq(expenses.id, expenseId),
          eq(expenses.tripId, tripId),
          sql`${expenses.archivedAt} IS NULL`,
        ),
      )
      .returning();

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
  },

  async getBalances(tripId: string) {
    const members = await db
      .select({ userId: tripMembers.userId })
      .from(tripMembers)
      .where(eq(tripMembers.tripId, tripId));

    const paidTotals = await db
      .select({
        userId: expenses.paidByUserId,
        total: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
      })
      .from(expenses)
      .where(and(eq(expenses.tripId, tripId), sql`${expenses.archivedAt} IS NULL`))
      .groupBy(expenses.paidByUserId);

    const shareTotals = await db
      .select({
        userId: expenseParticipants.userId,
        total: sql<string>`COALESCE(SUM(${expenseParticipants.shareAmount}), 0)`,
      })
      .from(expenseParticipants)
      .innerJoin(expenses, eq(expenseParticipants.expenseId, expenses.id))
      .where(and(eq(expenses.tripId, tripId), sql`${expenses.archivedAt} IS NULL`))
      .groupBy(expenseParticipants.userId);

    const receivedSettlements = await db
      .select({
        userId: settlements.toUserId,
        total: sql<string>`COALESCE(SUM(${settlements.amount}), 0)`,
      })
      .from(settlements)
      .where(eq(settlements.tripId, tripId))
      .groupBy(settlements.toUserId);

    const sentSettlements = await db
      .select({
        userId: settlements.fromUserId,
        total: sql<string>`COALESCE(SUM(${settlements.amount}), 0)`,
      })
      .from(settlements)
      .where(eq(settlements.tripId, tripId))
      .groupBy(settlements.fromUserId);

    const toMap = (rows: { userId: string; total: string }[]) => {
      const map = new Map<string, number>();
      for (const r of rows) map.set(r.userId, parseFloat(r.total));
      return map;
    };

    const paidMap = toMap(paidTotals);
    const shareMap = toMap(shareTotals);
    const receivedMap = toMap(receivedSettlements);
    const sentMap = toMap(sentSettlements);

    return members.map((m) => {
      const paid = paidMap.get(m.userId) ?? 0;
      const owed = shareMap.get(m.userId) ?? 0;
      const received = receivedMap.get(m.userId) ?? 0;
      const sent = sentMap.get(m.userId) ?? 0;
      return {
        userId: m.userId,
        balance: parseFloat((paid - owed + received - sent).toFixed(2)),
      };
    });
  },

  getSettlementSuggestions(balances: { userId: string; balance: number }[]) {
    const debtors: { userId: string; amount: number }[] = [];
    const creditors: { userId: string; amount: number }[] = [];

    for (const b of balances) {
      if (b.balance < -0.01) debtors.push({ userId: b.userId, amount: -b.balance });
      else if (b.balance > 0.01) creditors.push({ userId: b.userId, amount: b.balance });
    }

    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const suggestions: { fromUserId: string; toUserId: string; amount: number }[] = [];

    let di = 0;
    let ci = 0;
    while (di < debtors.length && ci < creditors.length) {
      const transfer = Math.min(debtors[di]!.amount, creditors[ci]!.amount);
      suggestions.push({
        fromUserId: debtors[di]!.userId,
        toUserId: creditors[ci]!.userId,
        amount: parseFloat(transfer.toFixed(2)),
      });
      debtors[di]!.amount -= transfer;
      creditors[ci]!.amount -= transfer;
      if (debtors[di]!.amount < 0.01) di++;
      if (creditors[ci]!.amount < 0.01) ci++;
    }

    return suggestions;
  },

  async settleUp(
    tripId: string,
    userId: string,
    data: { fromUserId: string; toUserId: string; amount: number },
  ) {
    const [settlement] = await db
      .insert(settlements)
      .values({
        tripId,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        amount: data.amount.toString(),
      } as typeof settlements.$inferInsert)
      .returning();

    await db.insert(activityLog).values({
      tripId,
      actorUserId: userId,
      type: 'settlement_recorded',
      referenceId: settlement!.id,
      referenceType: 'settlement',
    });

    return settlement;
  },

  async getBudgetOverview(tripId: string) {
    const [result] = await db
      .select({
        totalSpent: sql<string>`COALESCE(SUM(${expenses.amount}), 0)`,
        expenseCount: sql<number>`COUNT(*)::int`,
      })
      .from(expenses)
      .where(and(eq(expenses.tripId, tripId), sql`${expenses.archivedAt} IS NULL`));

    return {
      totalSpent: parseFloat(result?.totalSpent ?? '0'),
      expenseCount: result?.expenseCount ?? 0,
    };
  },
};
