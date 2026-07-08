import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { itineraryApi, tripApi } from '@/lib/api-client';
import { DaySection } from './day-section';
import { OutsideDatesWarning } from './outside-dates-warning';
import { AddEditEventModal } from './add-edit-event-modal';
import { useState } from 'react';
import type { ItineraryEvent } from '@/types/models';

interface ItineraryTimelineProps {
  tripId: string;
}

export function ItineraryTimeline({ tripId }: ItineraryTimelineProps) {
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  const {
    data: eventsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['itinerary', tripId],
    queryFn: () => itineraryApi.getEvents(tripId),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading itinerary...</div>;
  }

  if (error || !eventsData || !tripData) {
    return <div className="p-8 text-center text-destructive">Failed to load itinerary.</div>;
  }

  const events = eventsData.data.events;
  const trip = tripData.data.trip;

  const groupedEvents = new Map<string, ItineraryEvent[]>();

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const tripDays: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    tripDays.push(new Date(currentDate));
    const dateStr = currentDate.toISOString().split('T')[0];
    groupedEvents.set(dateStr, []);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  events.forEach((event) => {
    const eventDateStr = new Date(event.startAt).toISOString().split('T')[0];
    if (!groupedEvents.has(eventDateStr)) {
      groupedEvents.set(eventDateStr, []);
    }
    groupedEvents.get(eventDateStr)!.push(event);
  });

  groupedEvents.forEach((dayEvents) => {
    dayEvents.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });
  });

  const sortedDateKeys = Array.from(groupedEvents.keys()).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  const isOrganizerOrMember = trip.role === 'organizer' || trip.role === 'member';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Itinerary</h2>
        {isOrganizerOrMember && (
          <Button onClick={() => setIsAddEventModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>

      <OutsideDatesWarning
        events={events}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
      />

      <div className="space-y-8">
        {sortedDateKeys.map((dateStr) => {
          const dayEvents = groupedEvents.get(dateStr)!;
          const dateObj = new Date(dateStr);
          dateObj.setHours(0, 0, 0, 0);
          const diffTime = dateObj.getTime() - startDate.getTime();
          const dayNumber = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

          return (
            <DaySection
              key={dateStr}
              tripId={tripId}
              dateStr={dateStr}
              dayNumber={dayNumber}
              events={dayEvents}
              isOrganizerOrMember={isOrganizerOrMember}
            />
          );
        })}
      </div>

      <AddEditEventModal 
        tripId={tripId} 
        open={isAddEventModalOpen} 
        onOpenChange={setIsAddEventModalOpen} 
        tripStartDate={trip.startDate}
      />
    </div>
  );
}
