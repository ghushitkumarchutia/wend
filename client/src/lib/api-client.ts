const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && !(options?.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `API request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

import type {
  DashboardStatsResponse,
  TripsListResponse,
  UpdateProfileRequest,
  PhotoUrlRequest,
  PhotoConfirmRequest,
  ChangeEmailRequest,
  ChangePasswordRequest,
  DeleteAccountRequest,
  NotificationPreferencesResponse,
  NotificationPreferences,
  ApiSuccessResponse,
  CreateTripRequest,
  UpdateTripRequest,
  InviteMemberRequest,
  ChangeMemberRoleRequest,
  TransferOrganizerRequest,
  MembersListResponse,
  PendingInvitesListResponse,
  TripDetailResponse,
  CreateEventRequest,
  UpdateEventRequest,
  ReorderEventsRequest,
  ItineraryListResponse,
  EventDetailResponse,
  LogExpenseRequest,
  UpdateExpenseRequest,
  SettleUpRequest,
  ExpensesListResponse,
  ExpenseDetailResponse,
  BalancesResponse,
  SettlementSuggestionsResponse,
  BudgetOverviewResponse,
  DocumentUploadRequest,
  DocumentConfirmRequest,
  DocumentListResponse,
  PresignedUrlResponse,
  ChatMessageListResponse,
  SendMessageRequest,
  EditMessageRequest,
  PollListResponse,
  CreatePollRequest,
  CastVoteRequest,
  ActivityListResponse,
  TemplateListResponse,
  TemplateDetailResponse,
  CloneTemplateRequest,
  CloneTemplateResponse,
  NotificationListResponse,
  UnreadCountResponse,
} from '@/types/api';

export const dashboardApi = {
  getStats: () => fetcher<DashboardStatsResponse>('/v1/dashboard/stats'),
};

export const tripsApi = {
  listTrips: () => fetcher<TripsListResponse>('/v1/trips'),
};

export const accountApi = {
  updateProfile: (data: UpdateProfileRequest) =>
    fetcher<ApiSuccessResponse<void>>('/v1/account/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getPhotoUrl: (data: PhotoUrlRequest) =>
    fetcher<ApiSuccessResponse<{ url: string; key: string }>>('/v1/account/profile/photo-url', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmPhoto: (data: PhotoConfirmRequest) =>
    fetcher<ApiSuccessResponse<void>>('/v1/account/profile/photo-confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  changeEmail: (data: ChangeEmailRequest) =>
    fetcher<ApiSuccessResponse<void>>('/v1/account/change-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  changePassword: (data: ChangePasswordRequest) =>
    fetcher<ApiSuccessResponse<void>>('/v1/account/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteAccount: (data: DeleteAccountRequest) =>
    fetcher<ApiSuccessResponse<void>>('/v1/account', {
      method: 'DELETE',
      body: JSON.stringify(data),
    }),

  getNotificationPreferences: () =>
    fetcher<NotificationPreferencesResponse>('/v1/notifications/preferences'),

  updateNotificationPreferences: (data: Partial<NotificationPreferences>) =>
    fetcher<NotificationPreferencesResponse>('/v1/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const documentsApi = {
  getDocuments: (tripId: string) => fetcher<DocumentListResponse>(`/v1/trips/${tripId}/documents`),

  getUploadUrl: (tripId: string, data: DocumentUploadRequest) =>
    fetcher<PresignedUrlResponse>(`/v1/trips/${tripId}/documents/upload-url`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirmUpload: (tripId: string, data: DocumentConfirmRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/documents/confirm`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDownloadUrl: (tripId: string, docId: string) =>
    fetcher<PresignedUrlResponse>(`/v1/trips/${tripId}/documents/${docId}/download-url`),

  deleteDocument: (tripId: string, docId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/documents/${docId}`, {
      method: 'DELETE',
    }),
};

export const chatApi = {
  getMessages: (tripId: string, cursor?: string) => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return fetcher<ChatMessageListResponse>(`/v1/trips/${tripId}/messages${params}`);
  },

  sendMessage: (tripId: string, data: SendMessageRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  editMessage: (tripId: string, messageId: string, data: EditMessageRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteMessage: (tripId: string, messageId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/messages/${messageId}`, {
      method: 'DELETE',
    }),
};

export const pollsApi = {
  getPolls: (tripId: string) => fetcher<PollListResponse>(`/v1/trips/${tripId}/polls`),

  createPoll: (tripId: string, data: CreatePollRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/polls`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  castVote: (tripId: string, pollId: string, data: CastVoteRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/polls/${pollId}/votes`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  closePoll: (tripId: string, pollId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/polls/${pollId}/close`, {
      method: 'PATCH',
    }),
};

export const activityApi = {
  getActivity: (tripId: string, cursor?: string) => {
    const params = cursor ? `?cursor=${cursor}` : '';
    return fetcher<ActivityListResponse>(`/v1/trips/${tripId}/activity${params}`);
  },
};

export const invitesApi = {
  accept: (token: string) =>
    fetcher<ApiSuccessResponse<void>>('/v1/invites/accept', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  decline: (token: string) =>
    fetcher<ApiSuccessResponse<void>>('/v1/invites/decline', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
};

export const tripApi = {
  createTrip: (data: CreateTripRequest) =>
    fetcher<TripDetailResponse>('/v1/trips', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTrip: (tripId: string) => fetcher<TripDetailResponse>(`/v1/trips/${tripId}`),

  updateTrip: (tripId: string, data: UpdateTripRequest) =>
    fetcher<TripDetailResponse>(`/v1/trips/${tripId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteTrip: (tripId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}`, {
      method: 'DELETE',
    }),

  archiveTrip: (tripId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/archive`, {
      method: 'POST',
    }),

  restoreTrip: (tripId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/restore`, {
      method: 'POST',
    }),
};

export const travelersApi = {
  getMembers: (tripId: string) => fetcher<MembersListResponse>(`/v1/trips/${tripId}/members`),

  changeRole: (tripId: string, userId: string, data: ChangeMemberRoleRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/members/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  removeMember: (tripId: string, userId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/members/${userId}`, {
      method: 'DELETE',
    }),

  leaveTrip: (tripId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/members/leave`, {
      method: 'POST',
    }),

  transferOrganizer: (tripId: string, data: TransferOrganizerRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/members/transfer`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getPendingInvites: (tripId: string) =>
    fetcher<PendingInvitesListResponse>(`/v1/trips/${tripId}/invites`),

  sendInvite: (tripId: string, data: InviteMemberRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/invites`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  revokeInvite: (tripId: string, inviteId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/invites/${inviteId}/revoke`, {
      method: 'POST',
    }),

  resendInvite: (tripId: string, inviteId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/invites/${inviteId}/resend`, {
      method: 'POST',
    }),
};

export const itineraryApi = {
  getEvents: (tripId: string) => fetcher<ItineraryListResponse>(`/v1/trips/${tripId}/itinerary`),

  createEvent: (tripId: string, data: CreateEventRequest) =>
    fetcher<EventDetailResponse>(`/v1/trips/${tripId}/itinerary`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEvent: (tripId: string, eventId: string, data: UpdateEventRequest) =>
    fetcher<EventDetailResponse>(`/v1/trips/${tripId}/itinerary/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteEvent: (tripId: string, eventId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/itinerary/${eventId}`, {
      method: 'DELETE',
    }),

  reorderEvents: (tripId: string, data: ReorderEventsRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/itinerary/reorder`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};

export const ledgerApi = {
  getExpenses: (tripId: string) => fetcher<ExpensesListResponse>(`/v1/trips/${tripId}/expenses`),

  getExpense: (tripId: string, expenseId: string) =>
    fetcher<ExpenseDetailResponse>(`/v1/trips/${tripId}/expenses/${expenseId}`),

  logExpense: (tripId: string, data: LogExpenseRequest) =>
    fetcher<ExpenseDetailResponse>(`/v1/trips/${tripId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateExpense: (tripId: string, expenseId: string, data: UpdateExpenseRequest) =>
    fetcher<ExpenseDetailResponse>(`/v1/trips/${tripId}/expenses/${expenseId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteExpense: (tripId: string, expenseId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/expenses/${expenseId}`, {
      method: 'DELETE',
    }),

  getBalances: (tripId: string) => fetcher<BalancesResponse>(`/v1/trips/${tripId}/balances`),

  getSettlementSuggestions: (tripId: string) =>
    fetcher<SettlementSuggestionsResponse>(`/v1/trips/${tripId}/settlements/suggestions`),

  settleUp: (tripId: string, data: SettleUpRequest) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/trips/${tripId}/settlements`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getBudgetOverview: (tripId: string) =>
    fetcher<BudgetOverviewResponse>(`/v1/trips/${tripId}/budget-overview`),
};

export const exploreApi = {
  getTemplates: (params?: Record<string, string | number>) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    const queryString = searchParams.toString();
    const url = queryString ? `/v1/templates?${queryString}` : '/v1/templates';
    return fetcher<TemplateListResponse>(url);
  },

  getTemplate: (templateId: string) =>
    fetcher<TemplateDetailResponse>(`/v1/templates/${templateId}`),

  cloneTemplate: (templateId: string, data: CloneTemplateRequest) =>
    fetcher<CloneTemplateResponse>(`/v1/templates/${templateId}/clone`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const notificationsApi = {
  getNotifications: (cursor?: string, limit = 20) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (cursor) params.append('cursor', cursor);
    return fetcher<NotificationListResponse>(`/v1/notifications?${params.toString()}`);
  },

  getUnreadCount: () => fetcher<UnreadCountResponse>('/v1/notifications/unread-count'),

  markAsRead: (notificationId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/notifications/${notificationId}/read`, {
      method: 'PATCH',
    }),

  markAllAsRead: () =>
    fetcher<ApiSuccessResponse<void>>('/v1/notifications/mark-all-read', {
      method: 'POST',
    }),

  archive: (notificationId: string) =>
    fetcher<ApiSuccessResponse<void>>(`/v1/notifications/${notificationId}/archive`, {
      method: 'PATCH',
    }),

  archiveAllRead: () =>
    fetcher<ApiSuccessResponse<void>>('/v1/notifications/archive-all-read', {
      method: 'POST',
    }),

  getPreferences: () => fetcher<NotificationPreferencesResponse>('/v1/notifications/preferences'),

  updatePreferences: (data: Record<string, unknown>) =>
    fetcher<NotificationPreferencesResponse>('/v1/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
