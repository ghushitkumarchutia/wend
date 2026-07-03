import { z } from 'zod';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH, MAX_AVATAR_SIZE_BYTES } from '../constants.js';

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(60),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const setPasswordSchema = z
  .object({
    newPassword: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const changeEmailSchema = z.object({
  newEmail: z.string().email(),
  currentPassword: z.string().min(1),
});

export const deleteAccountConfirmSchema = z.object({
  confirmation: z.literal('delete my account'),
  currentPassword: z.string().min(1).optional(),
});

export const avatarUploadSchema = z.object({
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  sizeBytes: z.number().int().positive().max(MAX_AVATAR_SIZE_BYTES),
});
