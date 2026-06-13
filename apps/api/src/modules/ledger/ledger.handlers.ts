import type { Request, Response } from 'express';
import { LedgerService } from './ledger.service';
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

export async function getExpenses(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const data = await LedgerService.listExpenses(tripId);
  res.json({ data });
}

export async function getExpense(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const expenseId = req.params.expenseId as string;
  const expense = await LedgerService.getExpense(expenseId, tripId);
  if (!expense) {
    const err = new Error('Expense not found') as Error & { status: number };
    err.status = 404;
    throw err;
  }
  res.json({ data: expense });
}

export async function logExpense(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const expense = await LedgerService.logExpense(tripId, user.id, req.body);
  res.status(201).json({ data: expense });
}

export async function updateExpense(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const expenseId = req.params.expenseId as string;
  const expense = await LedgerService.updateExpense(expenseId, tripId, user.id, req.body);
  res.json({ data: expense });
}

export async function deleteExpense(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const expenseId = req.params.expenseId as string;
  await LedgerService.deleteExpense(expenseId, tripId, user.id);
  res.status(204).end();
}

export async function getBalances(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const balances = await LedgerService.getBalances(tripId);
  res.json({ data: balances });
}

export async function getSettlementSuggestions(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const balances = await LedgerService.getBalances(tripId);
  const suggestions = LedgerService.getSettlementSuggestions(balances);
  res.json({ data: suggestions });
}

export async function settleUp(req: Request, res: Response) {
  const user = await getSessionUser(req);
  const tripId = req.params.tripId as string;
  const settlement = await LedgerService.settleUp(tripId, user.id, req.body);
  res.status(201).json({ data: settlement });
}

export async function getBudgetOverview(req: Request, res: Response) {
  const tripId = req.params.tripId as string;
  const overview = await LedgerService.getBudgetOverview(tripId);
  res.json({ data: overview });
}
