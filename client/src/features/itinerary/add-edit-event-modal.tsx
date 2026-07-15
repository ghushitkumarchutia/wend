import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { FlightDetailsFields, type FlightDetailsFormValues } from './flight-details-fields';
import { itineraryApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { ItineraryEvent, EventCategory } from '@/types/models';

interface AddEditEventModalProps {
  tripId: string;
  event?: ItineraryEvent;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripStartDate: string;
}

export function AddEditEventModal({
  tripId,
  event,
  open,
  onOpenChange,
  tripStartDate,
}: AddEditEventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[480px] rounded-2xl bg-white pt-5 md:pt-6 pb-6 px-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95"
      >
        {open && (
          <EventForm
            tripId={tripId}
            event={event}
            tripStartDate={tripStartDate}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EventFormProps {
  tripId: string;
  event?: ItineraryEvent;
  tripStartDate: string;
  onClose: () => void;
}

function EventForm({ tripId, event, tripStartDate, onClose }: EventFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(event?.title || '');
  const [category, setCategory] = useState<EventCategory>(event?.category || 'activity');

  const [startDateObj, setStartDateObj] = useState<Date | undefined>(() => {
    if (event?.startAt) return new Date(event.startAt);
    if (tripStartDate) return new Date(tripStartDate);
    return new Date();
  });

  const [startTime, setStartTime] = useState<string>(() => {
    if (event?.startAt) {
      const d = new Date(event.startAt);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${mins}`;
    }
    return '10:00';
  });

  const [endDateObj, setEndDateObj] = useState<Date | undefined>(() => {
    if (event?.endAt) return new Date(event.endAt);
    return undefined;
  });

  const [endTime, setEndTime] = useState<string>(() => {
    if (event?.endAt) {
      const d = new Date(event.endAt);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${mins}`;
    }
    return '';
  });

  const [location, setLocation] = useState(event?.location || '');
  const [notes, setNotes] = useState(event?.notes || '');

  const [flightDetails, setFlightDetails] = useState<FlightDetailsFormValues>(() => {
    if (event?.flightDetails) {
      return {
        airline: event.flightDetails.airline || undefined,
        flightNumber: event.flightDetails.flightNumber || undefined,
        departureAirport: event.flightDetails.departureAirport || undefined,
        arrivalAirport: event.flightDetails.arrivalAirport || undefined,
        confirmationRef: event.flightDetails.confirmationRef || undefined,
        terminal: event.flightDetails.terminal || undefined,
        gate: event.flightDetails.gate || undefined,
        seat: event.flightDetails.seat || undefined,
        baggageAllowance: event.flightDetails.baggageAllowance || undefined,
      };
    }
    return {};
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDateObj) return;

    try {
      setIsSubmitting(true);

      const combineDateTime = (d: Date | undefined, t: string) => {
        if (!d) return undefined;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const [h = '10', m = '00'] = (t || '10:00').split(':');
        return new Date(`${year}-${month}-${day}T${h}:${m}:00`).toISOString();
      };

      const startAtISO = combineDateTime(startDateObj, startTime);
      const endAtISO = combineDateTime(endDateObj, endTime);

      if (!startAtISO) return;

      const payload = {
        title,
        category,
        startAt: startAtISO,
        endAt: endAtISO,
        location: location || undefined,
        notes: notes || undefined,
        flightDetails: category === 'flight' ? flightDetails : undefined,
      };

      if (event) {
        await itineraryApi.updateEvent(tripId, event.id, {
          ...payload,
          version: event.version,
        });
        toast.success('Event updated');
      } else {
        await itineraryApi.createEvent(tripId, payload);
        toast.success('Event added to itinerary');
      }

      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save event';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
        <DialogTitle className="text-[22px] font-semibold text-[#09a474] font-heading text-center">
          {event ? 'Edit Event' : 'Add Event'}
        </DialogTitle>
        <DialogDescription className="text-sm text-neutral-400 font-light text-center">
          {event
            ? 'Update the details for this scheduled event.'
            : 'Schedule a new activity, flight, or booking for this trip.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3 py-0 mt-3">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="event-title"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Title *
          </Label>
          <Input
            id="event-title"
            placeholder="e.g. Dinner at Luigi's"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label
            htmlFor="event-category"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(val) => val && setCategory(val as EventCategory)}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="event-category"
              className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 w-full cursor-pointer!"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl p-1 overflow-hidden ring-transparent">
              {['activity', 'flight', 'hotel', 'restaurant', 'transport', 'other'].map((cat) => (
                <SelectItem
                  key={cat}
                  value={cat}
                  className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! capitalize ${
                    cat === category
                      ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                      : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                  }`}
                >
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="event-start-date"
              className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
            >
              Start Date *
            </Label>
            <Popover>
              <PopoverTrigger className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-[#F6F6F6] hover:bg-[#f1f3f5] border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 text-left flex items-center justify-between cursor-pointer!"
                >
                  <span className={startDateObj ? 'text-neutral-900' : 'text-neutral-400'}>
                    {startDateObj ? format(startDateObj, 'MMM d, yyyy') : 'Select date'}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-neutral-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl overflow-hidden ring-transparent"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={startDateObj}
                  onSelect={(d) => d && setStartDateObj(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1">
            <Label
              htmlFor="event-start-time"
              className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
            >
              Start Time *
            </Label>
            <Input
              id="event-start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="event-end-date"
              className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
            >
              End Date (Optional)
            </Label>
            <Popover>
              <PopoverTrigger className="w-full">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-[#F6F6F6] hover:bg-[#f1f3f5] border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 text-left flex items-center justify-between cursor-pointer!"
                >
                  <span className={endDateObj ? 'text-neutral-900' : 'text-neutral-400'}>
                    {endDateObj ? format(endDateObj, 'MMM d, yyyy') : 'Select date'}
                  </span>
                  <CalendarIcon className="h-4 w-4 text-neutral-400" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl overflow-hidden ring-transparent"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={endDateObj}
                  onSelect={setEndDateObj}
                  disabled={startDateObj ? { before: startDateObj } : undefined}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1">
            <Label
              htmlFor="event-end-time"
              className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
            >
              End Time
            </Label>
            <Input
              id="event-end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={isSubmitting}
              className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label
            htmlFor="event-location"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Location / Address
          </Label>
          <Input
            id="event-location"
            placeholder="e.g. 123 Main St"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isSubmitting}
            className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label
            htmlFor="event-notes"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Notes
          </Label>
          <Textarea
            id="event-notes"
            placeholder="Any additional details..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl p-3 text-sm font-base transition-all duration-200 resize-none"
          />
        </div>

        {category === 'flight' && (
          <FlightDetailsFields
            value={flightDetails}
            onChange={setFlightDetails}
            disabled={isSubmitting}
          />
        )}
      </div>

      <div className="flex gap-4 mt-6">
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onClose}
          className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#ff5d62] hover:bg-[#e04f53] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !title || !startDateObj}
          className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#09a474] hover:bg-[#088f65] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
        >
          {isSubmitting ? 'Saving...' : 'Save Event'}
        </Button>
      </div>
    </form>
  );
}
