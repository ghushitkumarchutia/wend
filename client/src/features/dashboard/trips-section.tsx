import { useState, useMemo } from 'react';
import { TripCard } from './trip-card';
import type { TripWithRole } from '@/types/models';
import { Input } from '@/components/ui/input';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search02Icon, Cancel01Icon, Backpack03Icon } from '@hugeicons/core-free-icons';
import { CreateTripModal } from './create-trip-modal';

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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <nav
          className="w-full md:w-auto inline-flex items-center justify-between md:justify-start gap-0.5 md:gap-1 p-1 rounded-full bg-white border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-full overflow-x-auto no-scrollbar font-manrope select-none h-10 md:h-11"
          aria-label="Filter Trips"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            if (isActive) {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className="relative flex-1 md:flex-none inline-flex items-center justify-center h-full px-3.5 md:px-5 rounded-full text-white font-semibold text-xs md:text-sm cursor-pointer select-none shrink-0 group focus:outline-none transition-all duration-200 active:scale-[0.97]"
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
                  <span className="relative z-10 leading-none tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] whitespace-nowrap -translate-y-px">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 md:flex-none inline-flex items-center justify-center h-full px-3.5 md:px-5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80 font-medium text-xs md:text-sm transition-all duration-150 cursor-pointer shrink-0 group"
              >
                <span className="leading-none whitespace-nowrap tracking-wide -translate-y-px">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>

        <div className="flex w-full md:w-auto items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <HugeiconsIcon
              icon={Search02Icon}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400 shrink-0"
              strokeWidth={1.75}
            />
            <Input
              type="text"
              placeholder="Search trips..."
              className="w-full pl-9.5 pr-8 bg-white border border-black/5 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-full h-10 md:h-11 shadow-[0_8px_30px_rgb(0,0,0,0.08)] text-neutral-900 text-xs md:text-sm font-manrope placeholder:text-neutral-400 transition-all duration-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 focus:outline-none cursor-pointer transition-colors"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
          <CreateTripModal />
        </div>
      </div>

      {filteredTrips.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center bg-white/70 backdrop-blur-md border border-dashed border-neutral-200/90 rounded-2xl md:rounded-3xl p-12 text-center shadow-2xs"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.03)',
          }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100">
            <HugeiconsIcon
              icon={Backpack03Icon}
              className="h-8 w-8 text-neutral-400"
              strokeWidth={1.5}
            />
          </div>
          <h3 className="mt-4 text-lg font-semibold font-syne text-neutral-800">No trips found</h3>
          <p className="mb-4 mt-2 text-sm text-neutral-500 font-manrope">
            {searchQuery
              ? "We couldn't find any trips matching your search."
              : "You don't have any trips in this category. Create one to get started!"}
          </p>
          {!searchQuery && <CreateTripModal />}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
