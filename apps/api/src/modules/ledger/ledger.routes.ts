import { Router } from 'express';
import {
  getExpenses,
  getExpense,
  logExpense,
  updateExpense,
  deleteExpense,
  getBalances,
  getSettlementSuggestions,
  settleUp,
  getBudgetOverview,
} from './ledger.handlers';
import { validate } from '../../middleware/validate';
import { requireTripRole } from '../../middleware/require-trip-role';
import { logExpenseSchema, updateExpenseSchema, settleUpSchema } from '@wend/shared';

export const ledgerRouter = Router({ mergeParams: true });

ledgerRouter.get(
  '/:tripId/expenses',
  requireTripRole('viewer', 'member', 'organizer'),
  getExpenses,
);

ledgerRouter.get(
  '/:tripId/expenses/:expenseId',
  requireTripRole('viewer', 'member', 'organizer'),
  getExpense,
);

ledgerRouter.post(
  '/:tripId/expenses',
  requireTripRole('member', 'organizer'),
  validate({ body: logExpenseSchema }),
  logExpense,
);

ledgerRouter.patch(
  '/:tripId/expenses/:expenseId',
  requireTripRole('member', 'organizer'),
  validate({ body: updateExpenseSchema }),
  updateExpense,
);

ledgerRouter.delete(
  '/:tripId/expenses/:expenseId',
  requireTripRole('organizer'),
  deleteExpense,
);

ledgerRouter.get(
  '/:tripId/balances',
  requireTripRole('viewer', 'member', 'organizer'),
  getBalances,
);

ledgerRouter.get(
  '/:tripId/settlements/suggestions',
  requireTripRole('viewer', 'member', 'organizer'),
  getSettlementSuggestions,
);

ledgerRouter.post(
  '/:tripId/settlements',
  requireTripRole('member', 'organizer'),
  validate({ body: settleUpSchema }),
  settleUp,
);

ledgerRouter.get(
  '/:tripId/budget',
  requireTripRole('viewer', 'member', 'organizer'),
  getBudgetOverview,
);
