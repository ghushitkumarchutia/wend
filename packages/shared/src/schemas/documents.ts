import { z } from 'zod';
import { DocumentCategory, DocumentVisibility } from '../enums';
import { MAX_FILE_SIZE_BYTES, ALLOWED_DOCUMENT_TYPES, ALLOWED_IMAGE_TYPES } from '../constants';

const allAllowedTypes = [...ALLOWED_DOCUMENT_TYPES, ...ALLOWED_IMAGE_TYPES] as const;
const uniqueTypes = [...new Set(allAllowedTypes)] as [string, ...string[]];

export const uploadConfirmSchema = z.object({
  storageKey: z.string().min(1),
  fileName: z.string().min(1),
  fileType: z.enum(uniqueTypes),
  sizeBytes: z.number().int().positive().max(MAX_FILE_SIZE_BYTES),
  category: z.enum(DocumentCategory).optional(),
  visibility: z.enum(DocumentVisibility).default('shared'),
});
