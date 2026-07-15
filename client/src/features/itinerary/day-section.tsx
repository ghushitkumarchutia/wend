import { format } from 'date-fns';
import { SortableEventList } from './sortable-event-list';
import type { ItineraryEvent } from '@/types/models';

interface DaySectionProps {
  tripId: string;
  dateStr: string;
  dayNumber: number;
  events: ItineraryEvent[];
  isOrganizerOrMember: boolean;
}

export function DaySection({
  tripId,
  dateStr,
  dayNumber,
  events,
  isOrganizerOrMember,
}: DaySectionProps) {
  const dateObj = new Date(dateStr);
  const formattedDate = format(dateObj, 'EEE, MMMM d');

  const title = dayNumber >= 1 ? `Day ${dayNumber}` : 'Outside Trip Dates';

  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline gap-2">
        <h3 className="text-lg sm:text-xl font-semibold tracking-normal text-neutral-900">
          {title}
        </h3>
        <span className="text-base sm:text-lg font-medium text-neutral-400 tracking-normal">
          {formattedDate}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="w-full py-5 sm:py-6 px-6 text-center bg-white border border-dashed border-neutral-300 rounded-xl text-neutral-400 font-normal text-sm sm:text-base tracking-normal">
          No events scheduled for this day.
        </div>
      ) : (
        <SortableEventList
          tripId={tripId}
          events={events}
          isOrganizerOrMember={isOrganizerOrMember}
        />
      )}
    </section>
  );
}
