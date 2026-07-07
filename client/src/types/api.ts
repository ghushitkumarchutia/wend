import type { Template, TemplateDay, TemplateEvent } from './models';

export interface ApiResponse<T> {
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
