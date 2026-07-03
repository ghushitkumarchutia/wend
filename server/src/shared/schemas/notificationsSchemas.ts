import { z } from 'zod';
import { NotificationType } from '../enums.js';

export const updatePreferencesSchema = z.object({
  preferences: z
    .array(
      z.object({
        type: z.enum(NotificationType),
        inApp: z.boolean().optional(),
        email: z.boolean().optional(),
      }),
    )
    .min(1),
});
