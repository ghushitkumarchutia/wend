import { z } from 'zod';
import { ExpenseCategory, SplitMethod } from '../enums.js';
import { MAX_DESCRIPTION_LENGTH } from '../constants.js';

const participantSchema = z.object({
  userId: z.string(),
  shareAmount: z.number().nonnegative(),
});

export const logExpenseSchema = z.object({
  description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
  amount: z.number().positive(),
  category: z.enum(ExpenseCategory),
  paidByUserId: z.string(),
  splitMethod: z.enum(SplitMethod).default('equal'),
  incurredAt: z.string().datetime(),
  participants: z.array(participantSchema).min(1),
  receiptUrl: z.string().optional(),
});

export const updateExpenseSchema = z
  .object({
    description: z.string().min(1).max(MAX_DESCRIPTION_LENGTH),
    amount: z.number().positive(),
    category: z.enum(ExpenseCategory),
    paidByUserId: z.string(),
    splitMethod: z.enum(SplitMethod),
    incurredAt: z.string().datetime(),
    participants: z.array(participantSchema).min(1),
    receiptUrl: z.string().nullable(),
  })
  .partial()
  .extend({
    version: z.number().int().positive(),
  });

export const settleUpSchema = z.object({
  fromUserId: z.string(),
  toUserId: z.string(),
  amount: z.number().positive(),
});
