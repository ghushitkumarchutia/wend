import type {
  Template,
  TemplateDay,
  TemplateEvent,
  DashboardStats,
  TripWithRole,
  TripMember,
  TripInvite,
  TripMemberRole,
} from './models';

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details: unknown;
  };
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface TemplateStatsResponse {
  total: number;
  published: number;
  featured: number;
  totalClones: number;
}

export type TemplateListResponse = PaginatedApiResponse<Template>;

export interface TemplateDetailResponse extends Template {
  days: (TemplateDay & {
    events: TemplateEvent[];
  })[];
}

export type DashboardStatsResponse = ApiSuccessResponse<DashboardStats>;
export type TripsListResponse = ApiSuccessResponse<TripWithRole[]>;

export interface UpdateProfileRequest {
  name: string;
}

export interface PhotoUrlRequest {
  fileName: string;
  fileType: string;
  sizeBytes: number;
}

export interface PhotoConfirmRequest {
  storageKey: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
  currentPassword?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface DeleteAccountRequest {
  confirmation: string;
  currentPassword?: string;
}

export interface NotificationPreferences {
  email: {
    trip_invites: boolean;
    trip_updates: boolean;
    daily_digest: boolean;
    marketing: boolean;
  };
  push: {
    trip_invites: boolean;
    trip_updates: boolean;
    chat_mentions: boolean;
    reminders: boolean;
  };
}

export type NotificationPreferencesResponse = ApiSuccessResponse<NotificationPreferences>;

export interface CreateTripRequest {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description?: string;
  baseCurrency?: string;
  estimatedBudget?: number;
}

export interface UpdateTripRequest {
  name?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  description?: string | null;
  baseCurrency?: string;
  estimatedBudget?: number | null;
  coverImageUrl?: string | null;
}

export interface InviteMemberRequest {
  email: string;
  role: TripMemberRole;
  name?: string;
}

export interface ChangeMemberRoleRequest {
  role: TripMemberRole;
}

export interface TransferOrganizerRequest {
  userId: string;
}

export type MembersListResponse = ApiSuccessResponse<{
  members: TripMember[];
}>;

export type PendingInvitesListResponse = ApiSuccessResponse<{
  invites: TripInvite[];
}>;

export type TripDetailResponse = ApiSuccessResponse<{
  trip: TripWithRole;
}>;
