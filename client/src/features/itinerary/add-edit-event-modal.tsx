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
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, Clock01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
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
  defaultDate?: string;
}

const parseLocalDate = (dateStr?: string): Date | undefined => {
  if (!dateStr) return undefined;
  try {
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    const parts = cleanDate.split('-').map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) {
      return new Date(parts[0], parts[1] - 1, parts[2]);
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
};

const formatTimeDisplay = (timeStr: string) => {
  if (!timeStr) return 'Select time';
  const [hRaw = '10', mRaw = '00'] = timeStr.split(':');
  let h = parseInt(hRaw, 10);
  const m = parseInt(mRaw, 10);
  if (isNaN(h)) h = 10;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = String(isNaN(m) ? 0 : m).padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
};

export function AddEditEventModal({
  tripId,
  event,
  open,
  onOpenChange,
  tripStartDate,
  defaultDate,
}: AddEditEventModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="md:max-w-120 rounded-3xl md:rounded-[32px] bg-white pt-5 pb-6 px-6 md:pt-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 max-h-[90vh] overflow-y-auto font-manrope"
      >
        {open && (
          <EventForm
            tripId={tripId}
            event={event}
            tripStartDate={tripStartDate}
            defaultDate={defaultDate}
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
  defaultDate?: string;
  onClose: () => void;
}

const inputClass =
  'flex items-center bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-manrope leading-normal transition-all duration-200 shadow-2xs';

const generateAllTimeSlots = () => {
  const slots: { label: string; value: string }[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hStr = String(h).padStart(2, '0');
      const mStr = String(m).padStart(2, '0');
      const timeVal = `${hStr}:${mStr}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = String(m).padStart(2, '0');
      const label = `${displayH}:${displayM} ${period}`;
      slots.push({ label, value: timeVal });
    }
  }
  return slots;
};

const allTimeSlots = generateAllTimeSlots();

interface TimePickerPopoverProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

function TimePickerPopover({ value, onChange, disabled }: TimePickerPopoverProps) {
  const [open, setOpen] = useState(false);
  const formattedText = formatTimeDisplay(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        disabled={disabled}
        className={`${inputClass} w-full text-left flex items-center justify-between cursor-pointer!`}
      >
        <span className={value ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
          {formattedText}
        </span>
        <HugeiconsIcon
          icon={Clock01Icon}
          className="size-4.5 text-neutral-400 shrink-0"
          strokeWidth={1.75}
        />
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-50 p-1.5 bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-2xl overflow-hidden ring-transparent z-50 font-manrope"
      >
        <div className="max-h-56 overflow-y-auto pr-0.5 flex flex-col gap-0.5">
          {allTimeSlots.map((slot) => {
            const isSelected = slot.value === value;
            return (
              <button
                key={slot.value}
                type="button"
                onClick={() => {
                  onChange(slot.value);
                  setOpen(false);
                }}
                className={`w-full text-left py-2 px-3 text-xs font-manrope font-medium rounded-lg transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-black text-white font-bold shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <span>{slot.label}</span>
                {isSelected && (
                  <HugeiconsIcon
                    icon={Tick01Icon}
                    className="size-3.5 text-white"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EventForm({ tripId, event, tripStartDate, defaultDate, onClose }: EventFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState(event?.title || '');
  const [category, setCategory] = useState<EventCategory>(event?.category || 'activity');

  const [startDateObj, setStartDateObj] = useState<Date | undefined>(() => {
    if (event?.startAt) return parseLocalDate(event.startAt);
    if (defaultDate) return parseLocalDate(defaultDate);
    if (tripStartDate) return parseLocalDate(tripStartDate);
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
    if (event?.endAt) return parseLocalDate(event.endAt);
    return undefined;
  });

  const [endTime, setEndTime] = useState<string>(() => {
    if (event?.endAt) {
      const d = new Date(event.endAt);
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${mins}`;
    }
    return '11:00';
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

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error('Please enter a title for the event');
      return;
    }
    if (!startDateObj || isNaN(startDateObj.getTime())) {
      toast.error('Please select a valid start date');
      return;
    }

    try {
      setIsSubmitting(true);

      const combineDateTime = (d: Date | undefined, t: string) => {
        if (!d || isNaN(d.getTime())) return undefined;
        const year = d.getFullYear();
        const month = d.getMonth();
        const day = d.getDate();
        const [hRaw = '10', mRaw = '00'] = (t || '10:00').split(':');
        let h = parseInt(hRaw, 10);
        let m = parseInt(mRaw, 10);
        if (isNaN(h) || h < 0 || h > 23) h = 10;
        if (isNaN(m) || m < 0 || m > 59) m = 0;
        const localDate = new Date(year, month, day, h, m, 0);
        return localDate.toISOString();
      };

      const startAtISO = combineDateTime(startDateObj, startTime);
      const endAtISO = combineDateTime(endDateObj, endTime);

      if (!startAtISO) {
        toast.error('Failed to parse start date & time');
        return;
      }

      if (endAtISO) {
        const startMs = new Date(startAtISO).getTime();
        const endMs = new Date(endAtISO).getTime();
        if (endMs < startMs) {
          toast.error('End date & time cannot be earlier than start date & time');
          return;
        }
      }

      let cleanFlightDetails: FlightDetailsFormValues | undefined = undefined;
      if (category === 'flight' && flightDetails) {
        const entries = Object.entries(flightDetails)
          .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
          .filter(([, v]) => v !== undefined && v !== '');
        if (entries.length > 0) {
          cleanFlightDetails = Object.fromEntries(entries);
        }
      }

      const payload = {
        title: cleanTitle,
        category,
        startAt: startAtISO,
        endAt: endAtISO,
        location: location.trim() || undefined,
        notes: notes.trim() || undefined,
        flightDetails: cleanFlightDetails,
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

  const labelClass =
    'text-sm font-semibold text-neutral-800 tracking-wide select-none font-manrope';

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
        <DialogTitle className="text-xl md:text-2xl font-bold text-[#09a474] font-syne text-center tracking-tight">
          {event ? 'Edit Event' : 'Add Event'}
        </DialogTitle>
        <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed">
          {event
            ? 'Update the details for this scheduled event.'
            : 'Schedule a new activity, flight, or booking for this trip.'}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3.5 py-0 mt-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event-title" className={labelClass}>
            Title *
          </Label>
          <Input
            id="event-title"
            placeholder="e.g. Dinner at Luigi's"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className={inputClass}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event-category" className={labelClass}>
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(val) => val && setCategory(val as EventCategory)}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="event-category"
              className={`${inputClass} w-full cursor-pointer! flex items-center justify-between capitalize`}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent
              side="bottom"
              sideOffset={8}
              align="start"
              alignItemWithTrigger={false}
              className="w-full min-w-(--radix-select-trigger-width) bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-2xl p-2 overflow-hidden ring-transparent z-50 mt-1"
            >
              {['activity', 'flight', 'hotel', 'restaurant', 'transport', 'other'].map((cat) => {
                const isSelected = cat === category;
                return (
                  <SelectItem
                    key={cat}
                    value={cat}
                    className={`rounded-lg transition-all cursor-pointer py-2.25! px-3.5! pr-9! my-0.5 capitalize font-manrope text-sm font-medium ${
                      isSelected
                        ? 'text-white! hover:text-white! focus:text-white! focus:bg-[#059669]! hover:bg-[#059669]! **:text-white! hover:**:text-white! focus:**:text-white! font-semibold border border-white/30'
                        : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                    }`}
                    style={
                      isSelected
                        ? {
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            boxShadow: `
                              inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4),
                              inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2),
                              0 3px 10px -1px rgba(16, 185, 129, 0.35)
                            `,
                          }
                        : undefined
                    }
                  >
                    {cat}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-start-date" className={labelClass}>
              Start Date *
            </Label>
            <Popover>
              <PopoverTrigger
                type="button"
                className={`${inputClass} w-full text-left flex items-center justify-between cursor-pointer!`}
              >
                <span
                  className={startDateObj ? 'text-neutral-900 font-medium' : 'text-neutral-400'}
                >
                  {startDateObj ? format(startDateObj, 'MMM d, yyyy') : 'Select date'}
                </span>
                <HugeiconsIcon
                  icon={Calendar02Icon}
                  className="size-4.5 text-neutral-400 shrink-0"
                  strokeWidth={1.75}
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-2xl overflow-hidden ring-transparent z-50"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={startDateObj}
                  defaultMonth={startDateObj}
                  onSelect={(d) => d && setStartDateObj(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-start-time" className={labelClass}>
              Start Time *
            </Label>
            <TimePickerPopover value={startTime} onChange={setStartTime} disabled={isSubmitting} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-end-date" className={labelClass}>
              End Date (Optional)
            </Label>
            <Popover>
              <PopoverTrigger
                type="button"
                className={`${inputClass} w-full text-left flex items-center justify-between cursor-pointer!`}
              >
                <span className={endDateObj ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
                  {endDateObj ? format(endDateObj, 'MMM d, yyyy') : 'Select date'}
                </span>
                <HugeiconsIcon
                  icon={Calendar02Icon}
                  className="size-4.5 text-neutral-400 shrink-0"
                  strokeWidth={1.75}
                />
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0 bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-2xl overflow-hidden ring-transparent z-50"
                align="start"
              >
                <Calendar
                  mode="single"
                  selected={endDateObj}
                  defaultMonth={endDateObj || startDateObj}
                  onSelect={(d) => setEndDateObj(d)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="event-end-time" className={labelClass}>
              End Time (Optional)
            </Label>
            <TimePickerPopover value={endTime} onChange={setEndTime} disabled={isSubmitting} />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event-location" className={labelClass}>
            Location (Optional)
          </Label>
          <Input
            id="event-location"
            placeholder="Address or venue name"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            disabled={isSubmitting}
            className={inputClass}
          />
        </div>

        {category === 'flight' && (
          <FlightDetailsFields
            value={flightDetails}
            onChange={setFlightDetails}
            disabled={isSubmitting}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="event-notes" className={labelClass}>
            Notes (Optional)
          </Label>
          <Textarea
            id="event-notes"
            placeholder="Add any extra details, confirmation codes, or reminders..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl p-3 text-sm font-manrope transition-all duration-200 min-h-18 resize-none shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4.5 pt-1 w-full">
        <Button
          type="button"
          variant="waterdrop"
          onClick={onClose}
          disabled={isSubmitting}
          className="w-full flex-1 h-11 text-sm font-semibold font-manrope text-neutral-800 border border-white/90"
          style={{
            background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
            boxShadow: `
              inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
              inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.08),
              0 4px 12px -2px rgba(0, 0, 0, 0.08),
              0 1px 3px 0 rgba(0, 0, 0, 0.05)
            `,
          }}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          variant="waterdrop"
          disabled={isSubmitting || !title.trim() || !startDateObj}
          className="w-full flex-1 h-11 text-sm font-semibold font-manrope text-white border border-white/30"
          style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            boxShadow: `
              inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.4),
              inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
              0 4px 14px -2px rgba(16, 185, 129, 0.45),
              0 1px 3px 0 rgba(0, 0, 0, 0.1)
            `,
          }}
        >
          {isSubmitting ? 'Saving...' : event ? 'Update Event' : 'Add Event'}
        </Button>
      </div>
    </form>
  );
}
