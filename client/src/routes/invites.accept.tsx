import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

const inviteSearchSchema = z.object({
  token: z.string().optional(),
});

export const Route = createFileRoute('/invites/accept')({
  validateSearch: (search) => inviteSearchSchema.parse(search),
});
