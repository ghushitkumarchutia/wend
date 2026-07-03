import type {
  TripMemberRole,
  EventCategory,
  EventStatus,
  SplitMethod,
  ExpenseCategory,
  NotificationType,
  TemplateVisibility,
} from './enums.js';

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CursorPaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CursorParams {
  cursor?: string;
  limit?: number;
}

export interface TripWithRole {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  description: string | null;
  baseCurrency: string;
  estimatedBudget: string | null;
  coverImageUrl: string | null;
  archivedAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  role: TripMemberRole;
  memberCount: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'archived';
}

export interface FlightDetailsData {
  id: string;
  eventId: string;
  airline: string | null;
  flightNumber: string | null;
  departureAirport: string | null;
  arrivalAirport: string | null;
  confirmationRef: string | null;
  terminal: string | null;
  gate: string | null;
  seat: string | null;
  baggageAllowance: string | null;
}

export interface ItineraryEventWithDetails {
  id: string;
  tripId: string;
  title: string;
  category: EventCategory;
  status: EventStatus;
  startAt: string;
  endAt: string | null;
  location: string | null;
  notes: string | null;
  order: number;
  version: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  flightDetails: FlightDetailsData | null;
}

export interface MemberWithUser {
  id: string;
  tripId: string;
  userId: string;
  role: TripMemberRole;
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

export interface ExpenseWithParticipants {
  id: string;
  tripId: string;
  description: string;
  category: ExpenseCategory;
  amount: string;
  currency: string;
  paidByUserId: string;
  paidByUserName: string;
  splitMethod: SplitMethod;
  receiptUrl: string | null;
  incurredAt: string;
  version: number;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    userId: string;
    userName: string;
    shareAmount: string;
  }>;
}

export interface BalanceEntry {
  userId: string;
  userName: string;
  userImage: string | null;
  balance: string;
}

export interface SettlementSuggestion {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: string;
}

export interface NotificationWithMeta {
  id: string;
  userId: string;
  type: NotificationType;
  tripId: string | null;
  tripName: string | null;
  referenceId: string | null;
  referenceType: string | null;
  actorName: string | null;
  status: 'unread' | 'read' | 'archived';
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface TemplateWithDays {
  id: string;
  title: string;
  destination: string;
  description: string;
  coverImageUrl: string | null;
  categories: string[];
  recommendedGroupSizeMin: number | null;
  recommendedGroupSizeMax: number | null;
  bestSeason: string[] | null;
  difficultyLevel: string | null;
  estimatedBudgetBreakdown: Record<string, number> | null;
  estimatedBudgetCurrency: string | null;
  visibility: TemplateVisibility;
  cloneCount: number;
  createdAt: string;
  updatedAt: string;
  days: Array<{
    id: string;
    dayNumber: number;
    order: number;
    events: Array<{
      id: string;
      title: string;
      time: string | null;
      location: string | null;
      description: string | null;
      order: number;
    }>;
  }>;
}

export interface DocumentWithMeta {
  id: string;
  tripId: string;
  uploadedByUserId: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  storageKey: string;
  category: string | null;
  visibility: 'shared' | 'private';
  archivedAt: string | null;
  createdAt: string;
}

export interface BudgetOverview {
  totalSpent: number;
  expenseCount: number;
}

export interface DashboardStats {
  upcomingTrips: number;
  ongoingTrips: number;
  completedTrips: number;
  pendingInvites: number;
}
