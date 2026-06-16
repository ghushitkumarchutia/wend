import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { api, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { createEventSchema, EventCategory, EventStatus } from '@wend/shared';
import type { ItineraryEventWithDetails } from '@wend/shared';
import type { z } from 'zod';

type EventFormValues = z.infer<typeof createEventSchema>;

interface EventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  event?: ItineraryEventWithDetails | null;
  defaultDate?: Date;
}

const CATEGORY_OPTIONS: { value: (typeof EventCategory)[number]; label: string }[] = [
  { value: 'flight', label: 'Flight' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'activity', label: 'Activity' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS: { value: (typeof EventStatus)[number]; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'tentative', label: 'Tentative' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function EventModal({ open, onOpenChange, tripId, event, defaultDate }: EventModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!event;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      category: 'activity',
      status: 'confirmed',
      startAt: '',
      endAt: undefined,
      location: '',
      notes: '',
      flightDetails: undefined,
    },
  });

  const watchedCategory = watch('category');

  useEffect(() => {
    if (open) {
      if (event) {
        reset({
          title: event.title,
          category: event.category,
          status: event.status,
          startAt: event.startAt,
          endAt: event.endAt ?? undefined,
          location: event.location ?? '',
          notes: event.notes ?? '',
          flightDetails: event.flightDetails
            ? {
                airline: event.flightDetails.airline ?? undefined,
                flightNumber: event.flightDetails.flightNumber ?? undefined,
                departureAirport: event.flightDetails.departureAirport ?? undefined,
                arrivalAirport: event.flightDetails.arrivalAirport ?? undefined,
                confirmationRef: event.flightDetails.confirmationRef ?? undefined,
                terminal: event.flightDetails.terminal ?? undefined,
                gate: event.flightDetails.gate ?? undefined,
                seat: event.flightDetails.seat ?? undefined,
                baggageAllowance: event.flightDetails.baggageAllowance ?? undefined,
              }
            : undefined,
        });
      } else {
        reset({
          title: '',
          category: 'activity',
          status: 'confirmed',
          startAt: defaultDate ? defaultDate.toISOString() : '',
          endAt: undefined,
          location: '',
          notes: '',
          flightDetails: undefined,
        });
      }
    }
  }, [open, event, defaultDate, reset]);

  const createMutation = useMutation({
    mutationFn: (data: EventFormValues) =>
      api.post<{ data: ItineraryEventWithDetails }>(`/api/v1/trips/${tripId}/itinerary`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'itinerary'] });
      onOpenChange(false);
      toast.success('Event created');
    },
    onError: () => {
      toast.error('Failed to create event');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EventFormValues & { version: number }) =>
      api.patch<{ data: ItineraryEventWithDetails }>(
        `/api/v1/trips/${tripId}/itinerary/${event!.id}`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'itinerary'] });
      onOpenChange(false);
      toast.success('Event updated');
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(
          'This event was updated by another team member while you were editing. Please reload and try again.',
          { duration: 6000 },
        );
        queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'itinerary'] });
        return;
      }
      toast.error('Failed to update event');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: EventFormValues) {
    const payload = {
      ...data,
      flightDetails: data.category === 'flight' ? data.flightDetails : undefined,
    };

    if (isEditing) {
      updateMutation.mutate({ ...payload, version: event!.version });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Event' : 'Add Event'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1 pt-4">
          <div className="space-y-2">
            <Label htmlFor="event-title">Event name</Label>
            <Input id="event-title" placeholder="Event name" {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start date & time</Label>
              <Controller
                control={control}
                name="startAt"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                    placeholder="Start date"
                  />
                )}
              />
              {errors.startAt && (
                <p className="text-xs text-destructive">{errors.startAt.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>End date & time (optional)</Label>
              <Controller
                control={control}
                name="endAt"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value ? new Date(field.value) : undefined}
                    onChange={(date) => field.onChange(date ? date.toISOString() : undefined)}
                    placeholder="End date"
                  />
                )}
              />
              {errors.endAt && <p className="text-xs text-destructive">{errors.endAt.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-location">Location (optional)</Label>
            <Input id="event-location" placeholder="Venue or location" {...register('location')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="event-notes">Notes (optional)</Label>
            <Textarea
              id="event-notes"
              placeholder="Additional details"
              rows={3}
              {...register('notes')}
            />
            {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
          </div>

          {watchedCategory === 'flight' && (
            <>
              <Separator />
              <p className="text-sm font-medium">Flight Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="fd-airline" className="text-xs">
                    Airline
                  </Label>
                  <Input
                    id="fd-airline"
                    placeholder="e.g. All Nippon Airways"
                    {...register('flightDetails.airline')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fd-flight" className="text-xs">
                    Flight number
                  </Label>
                  <Input
                    id="fd-flight"
                    placeholder="e.g. NH 848"
                    {...register('flightDetails.flightNumber')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fd-dep" className="text-xs">
                    Departure airport
                  </Label>
                  <Input
                    id="fd-dep"
                    placeholder="e.g. NRT"
                    {...register('flightDetails.departureAirport')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fd-arr" className="text-xs">
                    Arrival airport
                  </Label>
                  <Input
                    id="fd-arr"
                    placeholder="e.g. LAX"
                    {...register('flightDetails.arrivalAirport')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fd-ref" className="text-xs">
                    Booking reference
                  </Label>
                  <Input
                    id="fd-ref"
                    placeholder="e.g. ABC123"
                    {...register('flightDetails.confirmationRef')}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fd-terminal" className="text-xs">
                    Terminal
                  </Label>
                  <Input id="fd-terminal" {...register('flightDetails.terminal')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fd-gate" className="text-xs">
                    Gate
                  </Label>
                  <Input id="fd-gate" {...register('flightDetails.gate')} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fd-seat" className="text-xs">
                    Seat
                  </Label>
                  <Input id="fd-seat" {...register('flightDetails.seat')} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label htmlFor="fd-baggage" className="text-xs">
                    Baggage allowance
                  </Label>
                  <Input
                    id="fd-baggage"
                    placeholder="e.g. 23kg checked + 7kg carry-on"
                    {...register('flightDetails.baggageAllowance')}
                  />
                </div>
              </div>
            </>
          )}

          <SheetFooter className="gap-2 pt-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Update Event' : 'Save Event'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function DateTimePicker({
  value,
  onChange,
  placeholder,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}) {
  function handleDateSelect(date: Date | undefined) {
    if (!date) {
      onChange(undefined);
      return;
    }
    if (value) {
      date.setHours(value.getHours(), value.getMinutes());
    }
    onChange(date);
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const parts = e.target.value.split(':').map(Number);
    const hours = parts[0] ?? 0;
    const minutes = parts[1] ?? 0;
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(hours, minutes, 0, 0);
    onChange(newDate);
  }

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              'flex-1 justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
          >
            <CalendarIcon className="mr-2 size-4" />
            {value ? format(value, 'd MMM yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={handleDateSelect} />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        className="w-24"
        value={value ? format(value, 'HH:mm') : ''}
        onChange={handleTimeChange}
      />
    </div>
  );
}
