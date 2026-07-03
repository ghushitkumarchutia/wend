export const UserRole = ['user', 'admin'] as const;
export type UserRole = (typeof UserRole)[number];

export const TripMemberRole = ['organizer', 'member', 'viewer'] as const;
export type TripMemberRole = (typeof TripMemberRole)[number];

export const InviteStatus = ['pending', 'accepted', 'declined', 'expired', 'revoked'] as const;
export type InviteStatus = (typeof InviteStatus)[number];

export const EventCategory = [
  'flight',
  'hotel',
  'restaurant',
  'activity',
  'transport',
  'other',
] as const;
export type EventCategory = (typeof EventCategory)[number];

export const EventStatus = ['confirmed', 'tentative', 'cancelled'] as const;
export type EventStatus = (typeof EventStatus)[number];

export const SplitMethod = ['equal', 'unequal', 'percentage', 'custom'] as const;
export type SplitMethod = (typeof SplitMethod)[number];

export const ExpenseCategory = [
  'accommodation',
  'food_and_drinks',
  'transport',
  'activities',
  'miscellaneous',
] as const;
export type ExpenseCategory = (typeof ExpenseCategory)[number];

export const DocumentCategory = [
  'flight',
  'hotel',
  'visa',
  'insurance',
  'booking',
  'other',
] as const;
export type DocumentCategory = (typeof DocumentCategory)[number];

export const DocumentVisibility = ['shared', 'private'] as const;
export type DocumentVisibility = (typeof DocumentVisibility)[number];

export const PollStatus = ['open', 'closed'] as const;
export type PollStatus = (typeof PollStatus)[number];

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

export const ActivityType = [
  'trip_created',
  'trip_updated',
  'trip_archived',
  'trip_restored',
  'member_joined',
  'member_left',
  'member_removed',
  'role_changed',
  'organizer_transferred',
  'event_created',
  'event_updated',
  'event_deleted',
  'expense_added',
  'expense_updated',
  'expense_deleted',
  'settlement_recorded',
  'document_uploaded',
  'document_deleted',
  'message_sent',
  'poll_created',
  'poll_closed',
  'poll_vote_cast',
] as const;
export type ActivityType = (typeof ActivityType)[number];

export const TemplateVisibility = ['draft', 'published', 'featured', 'hidden'] as const;
export type TemplateVisibility = (typeof TemplateVisibility)[number];

export const TemplateDifficulty = ['easy', 'moderate', 'challenging'] as const;
export type TemplateDifficulty = (typeof TemplateDifficulty)[number];

export const TemplateSeason = ['spring', 'summer', 'autumn', 'winter', 'year-round'] as const;
export type TemplateSeason = (typeof TemplateSeason)[number];
