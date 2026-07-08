import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarRange } from 'lucide-react';
import type { ItineraryEvent } from '@/types/models';

interface OutsideDatesWarningProps {
  events: ItineraryEvent[];
  tripStartDate: string;
  tripEndDate: string;
}

export function OutsideDatesWarning({ events, tripStartDate, tripEndDate }: OutsideDatesWarningProps) {
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
    <Alert variant="destructive" className="bg-destructive/10 text-destructive border-none">
      <CalendarRange className="h-4 w-4" />
      <AlertTitle>Events outside trip dates</AlertTitle>
      <AlertDescription>
        You have {outsideEvents.length} event{outsideEvents.length === 1 ? '' : 's'} scheduled outside the official trip dates. 
        They will appear in the itinerary, but you may want to update their dates or change the trip settings.
      </AlertDescription>
    </Alert>
  );
}
