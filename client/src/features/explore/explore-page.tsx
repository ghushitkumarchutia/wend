import { useState, useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { exploreApi } from '@/lib/api-client';
import { useDebounce } from '@/hooks/use-debounce';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import { CategoryFilterChips } from './category-filter-chips';
import { TemplateSortControl } from './template-sort-control';
import { TemplateCard } from './template-card';
import { TemplatePreviewModal } from './template-preview-modal';
import { CloneTemplateModal } from './clone-template-modal';
import type { Template } from '@/types/models';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search02Icon, Cancel02Icon, MapsIcon, Loading02Icon } from '@hugeicons/core-free-icons';
import exploreBg from '@/assets/explore.jpg';

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

const SEARCH_DESTINATIONS = [
  'Kyoto',
  'Tokyo',
  'Iceland',
  'Paris',
  'Swiss Alps',
  'Bali',
  'Santorini',
];

const PAGE_SIZE = 12;

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sort, setSort] = useState('popular');

  const [destIndex, setDestIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [cloneTemplate, setCloneTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const currentDest = SEARCH_DESTINATIONS[destIndex];
    let timerSpeed = isDeleting ? 40 : 100;

    if (!isDeleting && charIndex === currentDest.length) {
      timerSpeed = 1800;
    } else if (isDeleting && charIndex === 0) {
      timerSpeed = 500;
    }

    const timeout = setTimeout(() => {
      if (!isDeleting && charIndex === currentDest.length) {
        setIsDeleting(true);
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setDestIndex((prev) => (prev + 1) % SEARCH_DESTINATIONS.length);
      } else {
        setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      }
    }, timerSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, destIndex]);

  const typedText = SEARCH_DESTINATIONS[destIndex].substring(0, charIndex);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['explore-templates', debouncedSearch, selectedCategory, sort],
    queryFn: ({ pageParam = 1 }) =>
      exploreApi.getTemplates({
        search: debouncedSearch,
        category: selectedCategory || '',
        sort,
        page: pageParam as number,
        pageSize: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });

  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const templates = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const handleTemplateClick = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleCloneClick = (template: Template) => {
    setPreviewTemplate(null);
    setCloneTemplate(template);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#F5F5F7] font-manrope">
      <section
        className="relative w-full h-[70vh] min-h-120 md:h-screen md:min-h-162.5 flex items-center justify-center bg-cover bg-center bg-no-repeat overflow-hidden select-none"
        style={{ backgroundImage: `url(${exploreBg})` }}
      >
        <div className="absolute inset-0 bg-black/35 z-10" />

        <div className="container relative z-30 px-4 md:px-12 mx-auto flex flex-col items-center text-center -translate-y-6 md:-translate-y-10">
          <h1 className="text-[44px] md:text-[84px] lg:text-[100px] font-semibold tracking-tight text-white text-center max-w-4xl mx-auto leading-[1.08] font-syne drop-shadow-md">
            Explore Curated <br /> Itineraries
          </h1>

          <p className="mt-3.5 max-w-[320px] sm:max-w-xl md:max-w-2xl lg:max-w-none text-[12px] sm:text-base lg:text-lg text-white/90 font-light leading-relaxed font-manrope whitespace-normal lg:whitespace-nowrap">
            Discover and clone professional travel templates tailored for every kind of adventure.
          </p>

          <div className="mt-6 sm:mt-10 flex items-center w-full max-w-77.5 sm:max-w-2xl bg-white/95 backdrop-blur rounded-full p-1 sm:p-1.5 shadow-2xl border border-white/20 hover:bg-white transition-all cursor-default group">
            <div className="flex items-center gap-1.5 sm:gap-3 pl-2.5 sm:pl-4 flex-1 relative h-8 sm:h-10">
              <HugeiconsIcon
                icon={Search02Icon}
                strokeWidth={1.8}
                className="h-4 w-4 md:h-5.25 md:w-5.25 text-emerald-600 group-hover:scale-102 transition-transform shrink-0"
              />

              <div className="relative flex-1 h-full flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.slice(0, 45))}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 text-[13px] sm:text-base text-foreground font-medium placeholder-zinc-400 relative z-20 cursor-text"
                  placeholder={isFocused ? 'Search destination...' : ''}
                  maxLength={45}
                />

                {!isFocused && !searchQuery && (
                  <div className="absolute inset-0 flex items-center pointer-events-none z-10 text-[13px] sm:text-base text-left text-foreground font-medium select-none">
                    <span className="text-muted-foreground">Search </span>
                    <span className="text-foreground border-r-2 border-emerald-600 animate-pulse pr-0.5 ml-1">
                      {typedText}
                    </span>
                  </div>
                )}
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-red-500 hover:text-red-600 transition-colors z-30 cursor-pointer mr-1 flex items-center justify-center"
                >
                  <HugeiconsIcon icon={Cancel02Icon} className="h-4 w-4 text-red-500" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                document.getElementById('explore-grid')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-white font-semibold text-[11px] sm:text-sm cursor-pointer select-none shrink-0 group focus:outline-none transition-all duration-300 ease-out hover:scale-[1.03] hover:brightness-110 active:scale-[0.97]"
              style={{
                background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
                  0 6px 16px -2px rgba(16, 185, 129, 0.45),
                  0 3px 6px 0 rgba(0, 0, 0, 0.12)
                `,
              }}
            >
              <div className="absolute inset-x-2 md:inset-x-3 top-0.5 h-1 md:h-1.5 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
              <span className="relative z-10 inline-flex items-center justify-center text-center tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] whitespace-nowrap">
                EXPLORE
              </span>
            </button>
          </div>
        </div>
      </section>

      <main
        id="explore-grid"
        className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 md:py-12 space-y-4 md:space-y-5"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 w-full">
          <div className="w-full sm:w-auto">
            <CategoryFilterChips
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          <div className="w-full sm:w-auto">
            <TemplateSortControl value={sort} onChange={setSort} />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400 font-manrope">
            <HugeiconsIcon
              icon={Loading02Icon}
              className="h-9 w-9 animate-spin mb-4 text-emerald-500"
            />
            <p className="text-sm font-semibold text-neutral-600">Loading amazing templates...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-manrope">
            <p className="font-semibold text-base">
              Failed to load templates. Please try again later.
            </p>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-neutral-300 rounded-3xl bg-white p-8">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4">
              <HugeiconsIcon icon={MapsIcon} className="h-7 w-7 text-neutral-400" />
            </div>
            <h3 className="text-xl font-bold font-syne text-neutral-900 mb-1">
              No templates found
            </h3>
            <p className="text-sm text-neutral-500 max-w-md font-manrope">
              We couldn't find any templates matching your search criteria. Try adjusting your
              filters or search query.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:gap-5 grid-cols-1 md:grid-cols-2">
            {templates.map((template: Template) => (
              <TemplateCard key={template.id} template={template} onClick={handleTemplateClick} />
            ))}
          </div>
        )}

        {hasNextPage && (
          <div ref={ref} className="w-full h-20 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="w-6 h-6 border-2 border-[#10b981] border-t-transparent rounded-full animate-spin" />
            )}
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
