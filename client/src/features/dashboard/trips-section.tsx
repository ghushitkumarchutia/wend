import { useState, useMemo } from 'react';
import { TripCard } from './trip-card';
import type { TripWithRole } from '@/types/models';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { CreateTripModal } from './create-trip-modal';
import { cn } from '@/lib/utils';

interface TripsSectionProps {
  trips: TripWithRole[];
}

export function TripsSection({ trips }: TripsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'ongoing', label: 'Ongoing' },
    { id: 'completed', label: 'Completed' },
  ];

  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.destination.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (activeTab === 'all') return true;
      return trip.status === activeTab;
    });
  }, [trips, searchQuery, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex bg-[#f5f7f6] border border-neutral-200/50 rounded-xl p-1 w-full sm:w-[380px] select-none h-10 items-center">
          <div
            className="absolute top-1 bottom-1 rounded-lg bg-[#09a474] transition-all duration-300 ease-out shadow-sm"
            style={{
              width: 'calc(25% - 2px)',
              left: `calc(${activeIndex * 25}% - ${activeIndex * 2}px + 4px)`,
            }}
          />
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex-1 h-full flex items-center justify-center text-center text-xs sm:text-sm font-semibold transition-colors duration-300 z-10 focus:outline-none cursor-pointer',
                activeTab === tab.id ? 'text-white' : 'text-neutral-500 hover:text-neutral-900',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex w-full sm:w-auto items-center gap-4">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              type="text"
              placeholder="Search trips..."
              className="w-full pl-9 pr-8 bg-white border border-neutral-200 rounded-xl focus-visible:ring-1 focus-visible:ring-[#09a474] focus-visible:border-[#09a474] h-10 shadow-sm text-neutral-800 text-sm font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none"
              >
                <span className="text-lg">×</span>
              </button>
            )}
          </div>
          <CreateTripModal />
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No trips found</h3>
          <p className="mb-4 mt-2 text-sm text-muted-foreground">
            {searchQuery
              ? "We couldn't find any trips matching your search."
              : "You don't have any trips in this category. Create one to get started!"}
          </p>
          {!searchQuery && <CreateTripModal />}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
