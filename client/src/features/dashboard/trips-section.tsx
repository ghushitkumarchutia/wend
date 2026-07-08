import { useState, useMemo } from 'react';
import { TripCard } from './trip-card';
import type { TripWithRole } from '@/types/models';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateTripModal } from './create-trip-modal';

interface TripsSectionProps {
  trips: TripWithRole[];
}

export function TripsSection({ trips }: TripsSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
                            
      if (!matchesSearch) return false;
      
      if (activeTab === 'all') return true;
      return trip.status === activeTab;
    });
  }, [trips, searchQuery, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-4 sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex w-full sm:w-auto items-center gap-4">
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search trips..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
