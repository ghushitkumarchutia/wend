import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { exploreApi } from '@/lib/api-client';
import { TemplateSearchBar } from './template-search-bar';
import { CategoryFilterChips } from './category-filter-chips';
import { TemplateSortControl } from './template-sort-control';
import { TemplateCard } from './template-card';
import { TemplatePreviewModal } from './template-preview-modal';
import { CloneTemplateModal } from './clone-template-modal';
import type { Template } from '@/types/models';
import { Loader2, Sparkles, Map } from 'lucide-react';

const CATEGORIES = [
  'adventure',
  'relaxation',
  'culture',
  'food & drink',
  'nature',
  'urban exploration',
  'historical',
  'road trip',
  'romantic',
  'family friendly',
];

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState('popular');
  const [page] = useState(1);

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [cloneTemplate, setCloneTemplate] = useState<Template | null>(null);

  const {
    data: templatesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['explore-templates', searchQuery, selectedCategory, sort, page],
    queryFn: () =>
      exploreApi.getTemplates({
        q: searchQuery,
        category: selectedCategory || '',
        sort,
        page,
        limit: 12,
      }),
  });

  const handleTemplateClick = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleCloneClick = (template: Template) => {
    setPreviewTemplate(null);
    setCloneTemplate(template);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-muted/20">
      <section className="bg-primary/5 py-16 px-6 md:px-12 border-b">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2 text-primary">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            Explore Curated Itineraries
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and clone professional travel templates tailored for every kind of adventure.
          </p>

          <div className="flex justify-center pt-4">
            <TemplateSearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
        </div>
      </section>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full md:w-3/4 overflow-hidden">
            <CategoryFilterChips
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          <div className="shrink-0 w-full md:w-auto">
            <TemplateSortControl value={sort} onChange={setSort} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
            <p>Loading amazing templates...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            <p>Failed to load templates. Please try again later.</p>
          </div>
        ) : templatesResponse?.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-background border-dashed">
            <Map className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground max-w-md">
              We couldn't find any templates matching your search criteria. Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templatesResponse?.data.map((template: Template) => (
              <TemplateCard key={template.id} template={template} onClick={handleTemplateClick} />
            ))}
          </div>
        )}
      </main>

      <TemplatePreviewModal 
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        onCloneClick={handleCloneClick}
      />

      <CloneTemplateModal
        template={cloneTemplate}
        isOpen={!!cloneTemplate}
        onClose={() => setCloneTemplate(null)}
      />
    </div>
  );
}
