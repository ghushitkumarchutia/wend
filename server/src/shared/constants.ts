export const MAX_TRIP_NAME_LENGTH = 100;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_POLL_OPTIONS = 4;
export const MAX_POLL_QUESTION_LENGTH = 300;
export const MIN_PASSWORD_LENGTH = 10;
export const MAX_PASSWORD_LENGTH = 128;

export const CHAT_EDIT_WINDOW_MS = 15 * 60 * 1000;
export const INVITE_EXPIRY_DAYS = 7;
export const SESSION_EXPIRY_DAYS = 7;
export const COOKIE_CACHE_TTL_SECONDS = 5 * 60;

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;
export const MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const RATE_LIMITS = {
  SIGN_IN: { limit: 50, windowMs: 15 * 60 * 1000 },
  SIGN_UP: { limit: 5, windowMs: 60 * 60 * 1000 },
  FORGOT_PASSWORD: { limit: 3, windowMs: 60 * 60 * 1000 },
  RESEND_VERIFICATION: { limit: 3, windowMs: 60 * 60 * 1000 },
  GENERAL_GET: { limit: 200, windowMs: 60 * 1000 },
  GENERAL_MUTATE: { limit: 100, windowMs: 60 * 1000 },
  PUBLIC: { limit: 60, windowMs: 60 * 1000 },
  INVITE: { limit: 20, windowMs: 60 * 60 * 1000 },
  CHAT: { limit: 30, windowMs: 60 * 1000, burstLimit: 10, burstWindowMs: 10 * 1000 },
  POLL: { limit: 10, windowMs: 24 * 60 * 60 * 1000 },
  UPLOAD: { limit: 20, windowMs: 60 * 60 * 1000 },
  ADMIN: { limit: 60, windowMs: 60 * 1000 },
} as const;

export const EXPENSE_CATEGORIES_LIST = [
  { value: 'accommodation', label: 'Accommodation' },
  { value: 'food_and_drinks', label: 'Food & Drinks' },
  { value: 'transport', label: 'Transport' },
  { value: 'activities', label: 'Activities' },
  { value: 'miscellaneous', label: 'Miscellaneous' },
] as const;

export const CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'INR',
  'KRW',
  'MXN',
  'NZD',
  'SGD',
  'HKD',
  'THB',
  'SEK',
  'NOK',
  'DKK',
  'BRL',
  'ZAR',
] as const;
