import type {
  TemplateVisibility,
  TemplateDifficulty,
  TripMemberRole,
  EventCategory,
  EventStatus,
  SplitMethod,
  ExpenseCategory,
  NotificationType,
  DocumentCategory,
  DocumentVisibility,
} from './enums';

export type {
  TemplateVisibility,
  TemplateDifficulty,
  TripMemberRole,
  EventCategory,
  EventStatus,
  SplitMethod,
  ExpenseCategory,
  NotificationType,
  DocumentCategory,
  DocumentVisibility,
};

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

export interface DashboardStats {
  upcomingTrips: number;
  ongoingTrips: number;
  completedTrips: number;
  pendingInvites: number;
}

export interface Template {
  id: string;
  title: string;
  destination: string;
  description: string;
  coverImageUrl: string | null;
  visibility: TemplateVisibility;
  categories: string[];
  recommendedGroupSizeMin: number | null;
  recommendedGroupSizeMax: number | null;
  bestSeason: string[] | null;
  difficultyLevel: TemplateDifficulty | null;
  estimatedBudgetBreakdown: Record<string, number> | null;
  estimatedBudgetCurrency: string | null;
  cloneCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateDay {
  id: string;
  templateId: string;
  dayNumber: number;
  order: number;
}

export interface TemplateEvent {
  id: string;
  dayId: string;
  title: string;
  time: string | null;
  location: string | null;
  description: string | null;
  order: number;
}

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  role: TripMemberRole;
  joinedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface TripInvite {
  id: string;
  tripId: string;
  invitedEmail: string;
  inviterUserId: string;
  role: TripMemberRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'revoked';
  name: string | null;
  expiresAt: string;
  createdAt: string;
  inviter: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface ItineraryFlightDetails {
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

export interface ItineraryEvent {
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
  flightDetails: ItineraryFlightDetails | null;
}

export interface ExpenseParticipant {
  id: string;
  expenseId: string;
  userId: string;
  shareAmount: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: string;
  currency: string;
  category: ExpenseCategory;
  paidByUserId: string;
  splitMethod: SplitMethod;
  receiptUrl: string | null;
  incurredAt: string;
  version: number;
  archivedAt: string | null;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
  paidBy?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  participants?: ExpenseParticipant[];
}

export interface Settlement {
  id: string;
  tripId: string;
  fromUserId: string;
  toUserId: string;
  amount: string;
  createdAt: string;
  fromUser?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  toUser?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface TripDocument {
  id: string;
  tripId: string;
  uploadedByUserId: string;
  fileName: string;
  fileType: string;
  sizeBytes: number;
  storageKey: string;
  category: DocumentCategory | null;
  visibility: DocumentVisibility;
  archivedAt: string | null;
  createdAt: string;
  uploadedBy?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface ChatMessage {
  id: string;
  tripId: string;
  userId: string;
  body: string;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface PollVote {
  id: string;
  pollId: string;
  userId: string;
  optionId: string;
  votedAt: string;
}

export interface PollOption {
  id: string;
  pollId: string;
  text: string;
  order: number;
  votes?: PollVote[];
}

export interface Poll {
  id: string;
  tripId: string;
  question: string;
  status: 'open' | 'closed';
  deadline: string | null;
  version: number;
  createdByUserId: string;
  closedAt: string | null;
  createdAt: string;
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  options?: PollOption[];
}

export interface ActivityEntry {
  id: string;
  tripId: string;
  actorUserId: string;
  type: string;
  referenceId: string | null;
  referenceType: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface AppNotification {
  id: string;
  userId: string;
  type: string;
  tripId: string | null;
  tripName: string | null;
  referenceId: string | null;
  referenceType: string | null;
  actorName: string | null;
  status: 'unread' | 'read' | 'archived';
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface NotificationPreference {
  id: string;
  userId: string;
  type: string;
  inApp: boolean;
  email: boolean;
}
