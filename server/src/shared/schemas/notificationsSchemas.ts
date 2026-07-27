import { z } from 'zod';

const emailPreferencesSchema = z.object({
  trip_invites: z.boolean().optional(),
  trip_updates: z.boolean().optional(),
  daily_digest: z.boolean().optional(),
  marketing: z.boolean().optional(),
});

const pushPreferencesSchema = z.object({
  trip_invites: z.boolean().optional(),
  trip_updates: z.boolean().optional(),
  chat_mentions: z.boolean().optional(),
  reminders: z.boolean().optional(),
});

export const updatePreferencesSchema = z.object({
  email: emailPreferencesSchema.optional(),
  push: pushPreferencesSchema.optional(),
});
