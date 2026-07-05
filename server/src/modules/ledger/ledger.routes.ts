import { Router } from 'express';
import * as ledgerController from './ledger.controller.js';
import { validate } from '../../middleware/validate.js';
import { requireTripRole } from '../../middleware/require-trip-role.js';
import { generalGetLimiter, generalMutateLimiter } from '../../middleware/rate-limit.js';
import {
  logExpenseSchema,
  updateExpenseSchema,
  settleUpSchema,
} from '../../shared/schemas/ledgerSchemas.js';

export const ledgerRouter = Router();

ledgerRouter.get(
  '/:tripId/expenses',
  generalGetLimiter,
  requireTripRole('viewer'),
  ledgerController.getExpenses,
);

ledgerRouter.post(
  '/:tripId/expenses',
  generalMutateLimiter,
  requireTripRole('member'),
  validate({ body: logExpenseSchema }),
  ledgerController.logExpense,
);

ledgerRouter.get(
  '/:tripId/expenses/:expenseId',
  generalGetLimiter,
  requireTripRole('viewer'),
  ledgerController.getExpense,
);

ledgerRouter.patch(
  '/:tripId/expenses/:expenseId',
  generalMutateLimiter,
  requireTripRole('member'),
  validate({ body: updateExpenseSchema }),
  ledgerController.updateExpense,
);

ledgerRouter.delete(
  '/:tripId/expenses/:expenseId',
  generalMutateLimiter,
  requireTripRole('member'),
  ledgerController.deleteExpense,
);

ledgerRouter.get(
  '/:tripId/balances',
  generalGetLimiter,
  requireTripRole('viewer'),
  ledgerController.getBalances,
);

ledgerRouter.get(
  '/:tripId/settlements/suggestions',
  generalGetLimiter,
  requireTripRole('viewer'),
  ledgerController.getSettlementSuggestions,
);

ledgerRouter.post(
  '/:tripId/settlements',
  generalMutateLimiter,
  requireTripRole('member'),
  validate({ body: settleUpSchema }),
  ledgerController.settleUp,
);

ledgerRouter.get(
  '/:tripId/budget-overview',
  generalGetLimiter,
  requireTripRole('viewer'),
  ledgerController.getBudgetOverview,
);
