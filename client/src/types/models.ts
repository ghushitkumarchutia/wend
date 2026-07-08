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
