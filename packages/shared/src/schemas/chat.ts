import { z } from 'zod';
import { MAX_MESSAGE_LENGTH } from '../constants';

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});

export const editMessageSchema = z.object({
  body: z.string().min(1).max(MAX_MESSAGE_LENGTH),
});
