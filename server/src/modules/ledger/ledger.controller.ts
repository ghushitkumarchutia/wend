import type { Request, Response } from 'express';
import * as ledgerServices from './ledger.services.js';

export async function getExpenses(req: Request, res: Response): Promise<void> {
  const expenses = await ledgerServices.listExpenses(req.params.tripId as string);
  res.json({ data: expenses });
}

export async function logExpense(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const expense = await ledgerServices.createExpense(req.params.tripId as string, userId, req.body);
  res.status(201).json({ data: expense });
}

export async function getExpense(req: Request, res: Response): Promise<void> {
  const expense = await ledgerServices.getExpenseById(
    req.params.tripId as string,
    req.params.expenseId as string,
  );
  res.json({ data: expense });
}

export async function updateExpense(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const expense = await ledgerServices.updateExpense(
    req.params.tripId as string,
    req.params.expenseId as string,
    userId,
    req.body,
  );
  res.json({ data: expense });
}

export async function deleteExpense(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  await ledgerServices.softDeleteExpense(
    req.params.tripId as string,
    req.params.expenseId as string,
    userId,
  );
  res.json({ data: { success: true } });
}

export async function getBalances(req: Request, res: Response): Promise<void> {
  const balances = await ledgerServices.computeBalances(req.params.tripId as string);
  res.json({ data: balances });
}

export async function getSettlementSuggestions(req: Request, res: Response): Promise<void> {
  const suggestions = await ledgerServices.computeSettlementSuggestions(
    req.params.tripId as string,
  );
  res.json({ data: suggestions });
}

export async function settleUp(req: Request, res: Response): Promise<void> {
  const userId = (req as Request & { user: { id: string } }).user.id;
  const settlement = await ledgerServices.recordSettlement(
    req.params.tripId as string,
    userId,
    req.body,
  );
  res.status(201).json({ data: settlement });
}

export async function getBudgetOverview(req: Request, res: Response): Promise<void> {
  const overview = await ledgerServices.getBudgetOverview(req.params.tripId as string);
  res.json({ data: overview });
}
