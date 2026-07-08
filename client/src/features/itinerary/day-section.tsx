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
  const formattedDate = format(dateObj, 'EEE, MMM d');

  const title = dayNumber >= 1 ? `Day ${dayNumber}` : 'Outside Trip Dates';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {title} <span className="text-muted-foreground font-normal ml-2">{formattedDate}</span>
        </h3>
      </div>

      {events.length === 0 ? (
        <div className="text-sm text-muted-foreground py-4 text-center bg-muted/20 rounded-md border border-dashed">
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
