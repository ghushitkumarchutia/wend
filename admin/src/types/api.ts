import type { Template } from './models';

export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface TemplateStatsResponse {
  total: number;
  draft: number;
  published: number;
  featured: number;
  hidden: number;
  totalClones: number;
}

export type TemplateListResponse = PaginatedApiResponse<Template>;

export interface TemplateDetailResponse extends Template {
  days: (import('./models').TemplateDay & {
    events: import('./models').TemplateEvent[];
  })[];
}
