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
  
    getTrip: (tripId: string) =>
      fetcher<TripDetailResponse>(`/v1/trips/${tripId}`),
  
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
    getMembers: (tripId: string) =>
      fetcher<MembersListResponse>(`/v1/trips/${tripId}/members`),
  
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
