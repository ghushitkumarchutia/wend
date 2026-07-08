export const TemplateVisibility = ['draft', 'published', 'featured', 'hidden'] as const;
export type TemplateVisibility = (typeof TemplateVisibility)[number];

export const TemplateDifficulty = ['easy', 'moderate', 'challenging'] as const;
export type TemplateDifficulty = (typeof TemplateDifficulty)[number];

export const TemplateSeason = ['spring', 'summer', 'autumn', 'winter', 'year-round'] as const;
export type TemplateSeason = (typeof TemplateSeason)[number];

export const TripMemberRole = ['organizer', 'member', 'viewer'] as const;
export type TripMemberRole = (typeof TripMemberRole)[number];

export const InviteStatus = ['pending', 'accepted', 'declined', 'expired', 'revoked'] as const;
export type InviteStatus = (typeof InviteStatus)[number];

export const EventCategory = ['flight', 'hotel', 'restaurant', 'activity', 'transport', 'other'] as const;
export type EventCategory = (typeof EventCategory)[number];

export const EventStatus = ['confirmed', 'tentative', 'cancelled'] as const;
export type EventStatus = (typeof EventStatus)[number];

export const SplitMethod = ['equal', 'unequal', 'percentage', 'custom'] as const;
export type SplitMethod = (typeof SplitMethod)[number];

export const ExpenseCategory = ['accommodation', 'food_and_drinks', 'transport', 'activities', 'miscellaneous'] as const;
export type ExpenseCategory = (typeof ExpenseCategory)[number];

export const DocumentCategory = ['flight', 'hotel', 'visa', 'insurance', 'booking', 'other'] as const;
export type DocumentCategory = (typeof DocumentCategory)[number];

export const DocumentVisibility = ['shared', 'private'] as const;
export type DocumentVisibility = (typeof DocumentVisibility)[number];

export const NotificationType = [
  'trip_invite_received',
  'invite_accepted',
  'invite_declined',
  'member_joined',
  'member_left',
  'member_removed',
  'role_changed',
  'organizer_transferred',
  'event_created',
  'event_updated',
  'event_cancelled',
  'expense_added',
  'expense_updated',
  'settlement_recorded',
  'poll_created',
  'poll_closed',
  'poll_vote_changed',
  'document_uploaded',
  'document_deleted',
  'trip_departure_reminder',
  'event_reminder',
  'security_new_sign_in',
  'security_password_changed',
  'security_email_changed',
  'message_mention',
] as const;
export type NotificationType = (typeof NotificationType)[number];

export const BUDGET_CATEGORIES = [
  { key: 'accommodation', label: 'Accommodation' },
  { key: 'transport', label: 'Transport' },
  { key: 'foodAndDrinks', label: 'Food & Drinks' },
  { key: 'activities', label: 'Activities' },
  { key: 'miscellaneous', label: 'Miscellaneous' },
] as const;

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'KRW',
  'MXN', 'NZD', 'SGD', 'HKD', 'THB', 'SEK', 'NOK', 'DKK', 'BRL', 'ZAR',
] as const;
export type Currency = (typeof CURRENCIES)[number];
