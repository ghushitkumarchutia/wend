import type { TemplateVisibility, TemplateDifficulty } from './enums';

export type { TemplateVisibility, TemplateDifficulty };

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
