import type {
  Template,
  TemplateDay,
  TemplateEvent,
  DashboardStats,
  TripWithRole,
  TripMember,
  TripInvite,
  TripMemberRole,
  ItineraryEvent,
  EventCategory,
  EventStatus,
  Expense,
  ExpenseCategory,
  SplitMethod,
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

export interface FlightDetailsInput {
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  confirmationRef?: string;
  terminal?: string;
  gate?: string;
  seat?: string;
  baggageAllowance?: string;
}

export interface CreateEventRequest {
  title: string;
  category: EventCategory;
  status?: EventStatus;
  startAt: string;
  endAt?: string;
  location?: string;
  notes?: string;
  flightDetails?: FlightDetailsInput;
}

export interface UpdateEventRequest {
  title?: string;
  category?: EventCategory;
  status?: EventStatus;
  startAt?: string;
  endAt?: string | null;
  location?: string | null;
  notes?: string | null;
  flightDetails?: FlightDetailsInput | null;
  version: number;
}

export interface ReorderEventsRequest {
  events: {
    id: string;
    order: number;
  }[];
}

export type ItineraryListResponse = ApiSuccessResponse<{
  events: ItineraryEvent[];
}>;

export type EventDetailResponse = ApiSuccessResponse<{
  event: ItineraryEvent;
}>;

export interface LogExpenseRequest {
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidByUserId: string;
  splitMethod: SplitMethod;
  incurredAt: string;
  receiptUrl?: string;
  participants: {
    userId: string;
    shareAmount: number;
  }[];
}

export interface UpdateExpenseRequest {
  description?: string;
  amount?: number;
  category?: ExpenseCategory;
  paidByUserId?: string;
  splitMethod?: SplitMethod;
  incurredAt?: string;
  receiptUrl?: string | null;
  participants?: {
    userId: string;
    shareAmount: number;
  }[];
  version: number;
}

export interface SettleUpRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export type ExpensesListResponse = ApiSuccessResponse<{
  expenses: Expense[];
}>;

export type ExpenseDetailResponse = ApiSuccessResponse<{
  expense: Expense;
}>;

export interface MemberBalance {
  userId: string;
  balance: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export type BalancesResponse = ApiSuccessResponse<{
  balances: MemberBalance[];
  currency: string;
}>;

export interface SettlementSuggestion {
  fromUserId: string;
  toUserId: string;
  amount: string;
  fromUser: { id: string; name: string | null; email: string; image: string | null };
  toUser: { id: string; name: string | null; email: string; image: string | null };
}

export type SettlementSuggestionsResponse = ApiSuccessResponse<{
  suggestions: SettlementSuggestion[];
  currency: string;
}>;

export type BudgetOverviewResponse = ApiSuccessResponse<{
  estimatedBudget: string | null;
  totalSpent: string;
  currency: string;
  byCategory: Record<string, string>;
}>;
