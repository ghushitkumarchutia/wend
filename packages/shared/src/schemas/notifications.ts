import { z } from 'zod';
import { NotificationType } from '../enums';

export const updatePreferencesSchema = z.object({
  preferences: z.array(z.object({
    type: z.enum(NotificationType),
    email: z.boolean(),
  })).min(1),
});
