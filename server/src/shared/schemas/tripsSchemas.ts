import { z } from 'zod';
import { TripMemberRole } from '../enums.js';
import { MAX_TRIP_NAME_LENGTH, MAX_DESCRIPTION_LENGTH, CURRENCIES } from '../constants.js';

export const createTripSchema = z.object({
  name: z.string().min(1).max(MAX_TRIP_NAME_LENGTH),
  destination: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  baseCurrency: z.enum(CURRENCIES).default('USD'),
  estimatedBudget: z.number().positive().optional(),
  coverImageUrl: z.string().url().optional(),
});

export const updateTripSchema = z
  .object({
    name: z.string().min(1).max(MAX_TRIP_NAME_LENGTH),
    destination: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable(),
    baseCurrency: z.enum(CURRENCIES),
    estimatedBudget: z.number().positive().nullable(),
    coverImageUrl: z.string().nullable(),
  })
  .partial();

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(TripMemberRole),
  name: z.string().optional(),
});

export const acceptInviteSchema = z.object({
  token: z.string().min(1),
});

export const declineInviteSchema = z.object({
  token: z.string().min(1),
});

export const changeRoleSchema = z.object({
  role: z.enum(TripMemberRole),
});

export const transferOrganizerSchema = z.object({
  userId: z.string().uuid(),
});
