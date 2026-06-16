import { useState, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { Loader2, Globe2 } from 'lucide-react';

import { api } from '@/lib/api-client';
import { TemplateSearchBar } from './template-search-bar';
import { CategoryFilterChips } from './category-filter-chips';
import { TemplateSortControl } from './template-sort-control';
import { TemplateCard } from './template-card';
import { TemplatePreviewModal } from './template-preview-modal';

const EXPLORE_CATEGORIES = [
  'Adventure',
  'Relaxation',
  'Culture',
  'Food & Drink',
  'Nature',
  'City Break',
  'Road Trip',
  'Backpacking',
  'Luxury',
  'Family',
  'Couples',
];

export interface TemplatePreview {
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
  visibility: string;
  cloneCount: number;
  durationDays: number;
  createdAt: string;
}

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = useState('popular');

  const [selectedTemplate, setSelectedTemplate] = useState<{
    id: string;
    data?: TemplatePreview;
  } | null>(null);
  const { ref, inView } = useInView();

  // Handle deep link via query parameters if available
  useEffect(() => {
    // If router handles deep link in route parameters, it will not be here,
    // but we support opening via query param if needed.
  }, []);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery({
    queryKey: ['templates', 'published', { searchQuery, category, sort }],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      if (pageParam) params.set('cursor', pageParam);
      params.set('limit', '20');

      const response = await api.get<{ data: TemplatePreview[]; nextCursor: string | null }>(
        `/api/v1/templates?${params.toString()}`,
      );
      return response;
    },
    initialPageParam: '' as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const templates = data?.pages.flatMap((page) => page.data) || [];

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-10 bg-background/95 pb-4 pt-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Explore Itineraries</h1>
              <p className="text-muted-foreground">
                Discover and use community-created travel templates for your next adventure.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="w-full sm:max-w-md">
                <TemplateSearchBar value={searchQuery} onChange={setSearchQuery} />
              </div>
              <TemplateSortControl sort={sort} onChange={setSort} />
            </div>

            <CategoryFilterChips
              categories={EXPLORE_CATEGORIES}
              selectedCategory={category}
              onSelect={setCategory}
            />
          </div>
        </div>
      </div>

      <div className="container mx-auto flex-1 max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {status === 'pending' ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : status === 'error' ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
            <Globe2 className="size-12 text-muted-foreground/50" />
            <p className="text-lg font-medium text-muted-foreground">Failed to load templates</p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-4 text-center">
            <Globe2 className="size-12 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">No templates found</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              We couldn't find any templates matching your current filters. Try adjusting your
              search or category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={() => setSelectedTemplate({ id: template.id, data: template })}
              />
            ))}
            <div ref={ref} className="col-span-full flex justify-center py-4">
              {isFetchingNextPage && (
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>
        )}
      </div>

      <TemplatePreviewModal
        templateId={selectedTemplate?.id || null}
        previewData={selectedTemplate?.data}
        open={!!selectedTemplate}
        onOpenChange={(open) => !open && setSelectedTemplate(null)}
      />
    </div>
  );
}
