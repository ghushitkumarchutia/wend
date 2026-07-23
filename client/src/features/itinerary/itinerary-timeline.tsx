import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
import { itineraryApi, tripApi } from '@/lib/api-client';
import { DaySection } from './day-section';
import { OutsideDatesWarning } from './outside-dates-warning';
import { AddEditEventModal } from './add-edit-event-modal';
import { useState } from 'react';
import { format } from 'date-fns';
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

  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    groupedEvents.set(dateStr, []);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  events.forEach((event) => {
    const eventDateStr = format(new Date(event.startAt), 'yyyy-MM-dd');
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
    <div className="space-y-2.5 md:space-y-3">
      <div className="flex items-center justify-between mt-1 md:-mt-3">
        <h2 className="text-[18px] md:text-2xl font-semibold tracking-wide text-neutral-900 font-syne">
          Itinerary
        </h2>
        {isOrganizerOrMember && (
          <Button
            variant="waterdrop"
            onClick={() => setIsAddEventModalOpen(true)}
            className="pl-2 md:pl-2.5 pr-2.5 md:pr-3.5 py-1.5 md:py-1.75 h-auto inline-flex items-center"
          >
            <div
              className="size-3.5 md:size-5.5 rounded-full bg-white flex items-center justify-center shrink-0 relative z-10 group-hover:scale-105 transition-transform translate-y-[-0.4px]"
              style={{
                boxShadow: `
                  inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                  inset 0 1px 2px rgba(255, 255, 255, 1),
                  0 2px 4px rgba(0, 0, 0, 0.15)
                `,
              }}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                className="size-2.5 md:size-3.5 block"
                color="#10b981"
                strokeWidth={2.5}
              />
            </div>

            <span className="text-[10px] md:text-sm font-semibold tracking-wide text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] leading-none relative top-[-0.7px] md:top-[-1.5px]">
              Add Event
            </span>
          </Button>
        )}
      </div>

      <OutsideDatesWarning
        events={events}
        tripStartDate={trip.startDate}
        tripEndDate={trip.endDate}
      />

      <div className="space-y-5">
        {sortedDateKeys.map((dateStr) => {
          const dayEvents = groupedEvents.get(dateStr)!;
          const [year, month, day] = dateStr.split('-').map(Number);
          const dateObj = new Date(year, month - 1, day);
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
