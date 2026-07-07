import { create } from 'zustand';
import type { Template, TemplateDifficulty } from '@/types/models';

type PartialTemplate = Partial<
  Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'cloneCount'>
>;

interface TemplateFormState {
  data: PartialTemplate;
  isDirty: boolean;

  hydrate: (template: Template) => void;
  updateGeneralInfo: (info: {
    title?: string;
    destination?: string;
    description?: string;
    coverImageUrl?: string | null;
  }) => void;
  updateMetadata: (meta: {
    visibility?: Template['visibility'];
    categories?: string[];
    recommendedGroupSizeMin?: number | null;
    recommendedGroupSizeMax?: number | null;
    bestSeason?: string[] | null;
    difficultyLevel?: TemplateDifficulty | null;
  }) => void;
  updateBudget: (budget: {
    estimatedBudgetCurrency?: string | null;
    estimatedBudgetBreakdown?: Record<string, number> | null;
  }) => void;
  reset: () => void;
}

const initialState: PartialTemplate = {
  title: '',
  destination: '',
  description: '',
  coverImageUrl: null,
  visibility: 'draft',
  categories: [],
  recommendedGroupSizeMin: null,
  recommendedGroupSizeMax: null,
  bestSeason: null,
  difficultyLevel: null,
  estimatedBudgetBreakdown: null,
  estimatedBudgetCurrency: null,
};

export const useTemplateFormStore = create<TemplateFormState>((set) => ({
  data: initialState,
  isDirty: false,

  hydrate: (template) => set({ data: template, isDirty: false }),

  updateGeneralInfo: (info) =>
    set((state) => ({
      data: { ...state.data, ...info },
      isDirty: true,
    })),

  updateMetadata: (meta) =>
    set((state) => ({
      data: { ...state.data, ...meta },
      isDirty: true,
    })),

  updateBudget: (budget) =>
    set((state) => ({
      data: { ...state.data, ...budget },
      isDirty: true,
    })),

  reset: () => set({ data: initialState, isDirty: false }),
}));
