import { useState, useMemo } from 'react';
import { Search, LayoutGrid, List, MapPinOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { ErrorState } from '@/components/shared/error-state';
import { TripCardSkeleton } from '@/components/shared/loading-skeleton';
import { TripCard } from '@/features/dashboard/trip-card';
import { useDashboardViewStore } from '@/stores/dashboard-view-store';
import type { TripWithRole } from '@wend/shared';

type FilterStatus = 'all' | 'upcoming' | 'ongoing' | 'completed' | 'archived';
type SortOption = 'startDate' | 'updatedAt' | 'name';

const FILTER_CHIPS: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'startDate', label: 'Next start date' },
  { value: 'updatedAt', label: 'Recently updated' },
  { value: 'name', label: 'Alphabetical' },
];

interface TripsSectionProps {
  trips: TripWithRole[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function TripsSection({ trips, isLoading, isError, onRetry }: TripsSectionProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [sort, setSort] = useState<SortOption>('startDate');
  const { viewMode, setViewMode } = useDashboardViewStore();

  const filteredAndSorted = useMemo(() => {
    let result = trips;

    if (filter === 'all') {
      result = result.filter((t) => t.status !== 'archived');
    } else {
      result = result.filter((t) => t.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.destination.toLowerCase().includes(q),
      );
    }

    result = [...result].sort((a, b) => {
      if (sort === 'startDate') {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      }
      if (sort === 'updatedAt') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [trips, filter, search, sort]);

  if (isError) {
    return (
      <div className="py-8">
        <ErrorState message="Couldn't load your trips." onRetry={onRetry} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Trips</h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trips…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTER_CHIPS.map((chip) => (
          <Button
            key={chip.value}
            variant={filter === chip.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(chip.value)}
            className="shrink-0"
          >
            {chip.label}
          </Button>
        ))}
      </div>

      {isLoading && (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <TripCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!isLoading && trips.length === 0 && (
        <EmptyState
          icon={MapPinOff}
          title="No trips yet"
          description="Ready to plan your first adventure?"
          actionLabel="Create Your First Trip"
        />
      )}

      {!isLoading && trips.length > 0 && filteredAndSorted.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-muted-foreground">
            No {filter === 'all' ? '' : filter} trips found.
          </p>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="mt-1 text-sm text-primary underline-offset-4 hover:underline"
          >
            Clear filter
          </button>
        </div>
      )}

      {!isLoading && filteredAndSorted.length > 0 && (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {filteredAndSorted.map((trip) => (
            <TripCard key={trip.id} trip={trip} viewMode={viewMode} />
          ))}
        </div>
      )}
    </div>
  );
}
