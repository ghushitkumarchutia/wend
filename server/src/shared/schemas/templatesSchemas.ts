import { z } from 'zod';
import { TemplateVisibility, TemplateDifficulty, TemplateSeason } from '../enums.js';
import { MAX_TRIP_NAME_LENGTH, MAX_DESCRIPTION_LENGTH, CURRENCIES } from '../constants.js';

export const createTemplateSchema = z.object({
  title: z.string().min(1).max(MAX_TRIP_NAME_LENGTH),
  destination: z.string().min(1),
  description: z.string().min(1).max(2000),
  coverImageUrl: z.string().nullish(),
  visibility: z.enum(TemplateVisibility).default('draft'),
  categories: z.array(z.string().min(1)).default([]),
  recommendedGroupSizeMin: z.number().int().positive().nullish(),
  recommendedGroupSizeMax: z.number().int().positive().nullish(),
  bestSeason: z.array(z.enum(TemplateSeason)).nullish(),
  difficultyLevel: z.enum(TemplateDifficulty).nullish(),
  estimatedBudgetBreakdown: z
    .object({
      accommodation: z.number().nonnegative(),
      transport: z.number().nonnegative(),
      foodAndDrinks: z.number().nonnegative(),
      activities: z.number().nonnegative(),
      miscellaneous: z.number().nonnegative(),
    })
    .nullish(),
  estimatedBudgetCurrency: z.enum(CURRENCIES).nullish(),
});

export const updateTemplateSchema = createTemplateSchema
  .omit({ visibility: true })
  .extend({
    visibility: z.enum(TemplateVisibility).optional(),
  })
  .partial();

export const changeVisibilitySchema = z.object({
  visibility: z.enum(TemplateVisibility),
});

export const cloneTemplateSchema = z
  .object({
    existingTripId: z.string().uuid().optional(),
    tripName: z.string().min(1).max(MAX_TRIP_NAME_LENGTH).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    destination: z.string().min(1).optional(),
    baseCurrency: z.enum(CURRENCIES).optional(),
  })
  .refine((data) => data.existingTripId || (data.tripName && data.startDate && data.endDate), {
    message: 'Provide existingTripId or tripName with start and end dates',
  });

export const addDaySchema = z.object({
  dayNumber: z.number().int().positive(),
});

export const addEventSchema = z.object({
  title: z.string().min(1).max(MAX_TRIP_NAME_LENGTH),
  time: z.string().optional(),
  location: z.string().optional(),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  order: z.number(),
});

export const updateTemplateEventSchema = z
  .object({
    title: z.string().min(1).max(MAX_TRIP_NAME_LENGTH),
    time: z.string().nullable(),
    location: z.string().nullable(),
    description: z.string().max(MAX_DESCRIPTION_LENGTH).nullable(),
    order: z.number(),
  })
  .partial();

export const reorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().uuid(),
        order: z.number(),
      }),
    )
    .min(1),
});
