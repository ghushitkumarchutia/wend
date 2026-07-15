import { CalendarRange } from 'lucide-react';
import type { ItineraryEvent } from '@/types/models';

interface OutsideDatesWarningProps {
  events: ItineraryEvent[];
  tripStartDate: string;
  tripEndDate: string;
}

export function OutsideDatesWarning({
  events,
  tripStartDate,
  tripEndDate,
}: OutsideDatesWarningProps) {
  const start = new Date(tripStartDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(tripEndDate);
  end.setHours(23, 59, 59, 999);

  const outsideEvents = events.filter((event) => {
    const eventDate = new Date(event.startAt);
    return eventDate < start || eventDate > end;
  });

  if (outsideEvents.length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-amber-900 shadow-2xs flex items-start gap-3">
      <CalendarRange className="h-5 w-5 text-amber-600 shrink-0 mt-0.5 stroke-1" />
      <div className="space-y-0.5 text-xs sm:text-sm">
        <h5 className="font-semibold text-amber-900 tracking-wide">Events outside trip dates</h5>
        <p className="text-amber-800/80 font-normal leading-relaxed">
          You have {outsideEvents.length} event{outsideEvents.length === 1 ? '' : 's'} scheduled
          outside the official trip dates. They appear in the itinerary timeline below for your
          reference.
        </p>
      </div>
    </div>
  );
}
