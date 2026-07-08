import type { TemplateVisibility, TemplateDifficulty, TripMemberRole, EventCategory, EventStatus, SplitMethod, ExpenseCategory, NotificationType } from './enums';

export type { TemplateVisibility, TemplateDifficulty, TripMemberRole, EventCategory, EventStatus, SplitMethod, ExpenseCategory, NotificationType };

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
