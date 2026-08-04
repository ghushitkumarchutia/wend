import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
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
import { FlightDetailsFields, type FlightDetailsFormValues } from './flight-details-fields';
import { EventCategory, EventStatus } from '@/types/enums';
import type { TemplateEvent } from '@/types/models';
import { toast } from 'sonner';

interface Props {
  templateId: string;
  dayId: string;
  existingEventCount?: number;
  event?: TemplateEvent;
  onClose: () => void;
}

export function EventInlineForm({
  templateId,
  dayId,
  existingEventCount = 0,
  event,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: event?.title ?? '',
    time: event?.time ?? '',
    location: event?.location ?? '',
    description: event?.description ?? '',
    category: event?.category ?? 'activity',
    status: event?.status ?? 'confirmed',
  });

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

  const mutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (event?.id) {
        return fetcher(`/admin/templates/${templateId}/events/${event.id}`, {
          method: 'PATCH',
          body: JSON.stringify(data),
        });
      } else {
        return fetcher(`/admin/templates/${templateId}/days/${dayId}/events`, {
          method: 'POST',
          body: JSON.stringify(data),
        });
      }
    },
    onSuccess: () => {
      toast.success(event?.id ? 'Event updated' : 'Event added');
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      onClose();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save event');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error('Title is required');

    let cleanFlightDetails: FlightDetailsFormValues | undefined = undefined;
    if (formData.category === 'flight' && flightDetails) {
      const entries = Object.entries(flightDetails)
        .map(([k, v]) => [k, v?.trim()])
        .filter(([, v]) => v !== undefined && v !== '');
      if (entries.length > 0) {
        cleanFlightDetails = Object.fromEntries(entries);
      }
    }

    const payload: Record<string, unknown> = {
      title: formData.title.trim(),
      category: formData.category,
      status: formData.status,
    };

    if (event?.id) {
      payload.time = formData.time || null;
      payload.location = formData.location || null;
      payload.description = formData.description || null;
      payload.flightDetails = cleanFlightDetails || null;
    } else {
      payload.order = existingEventCount;
      if (formData.time) payload.time = formData.time;
      if (formData.location) payload.location = formData.location;
      if (formData.description) payload.description = formData.description;
      if (cleanFlightDetails) payload.flightDetails = cleanFlightDetails;
    }

    mutation.mutate(payload);
  };

  const inputClass = "bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5 md:h-11 px-4 text-sm font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 shadow-2xs";
  const labelClass = "text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none";

  return (
    <div className="rounded-[24px] border border-emerald-100 p-5 md:p-6 bg-emerald-50/30 mt-4 space-y-5 shadow-sm transition-all duration-300">
      <h4 className="font-bold text-lg font-syne text-neutral-900">
        {event?.id ? 'Edit Event' : 'Add New Event'}
      </h4>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Title *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Visit Kiyomizu-dera"
              autoFocus
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className={labelClass}>Category</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(val) => setFormData({ ...formData, category: val ?? '' })}
              >
                <SelectTrigger className="bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5! md:h-11! px-4 text-sm font-manrope font-semibold text-neutral-900 transition-all duration-200 w-full cursor-pointer! shadow-2xs">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl font-manrope">
                  {EventCategory.map((c: string) => (
                    <SelectItem key={c} value={c} className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className={labelClass}>Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(val) => setFormData({ ...formData, status: val ?? '' })}
              >
                <SelectTrigger className="bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl h-10.5! md:h-11! px-4 text-sm font-manrope font-semibold text-neutral-900 transition-all duration-200 w-full cursor-pointer! shadow-2xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl font-manrope">
                  {EventStatus.map((s: string) => (
                    <SelectItem key={s} value={s} className="cursor-pointer focus:bg-emerald-50 focus:text-emerald-700">
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Time (optional)</Label>
            <Input
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              placeholder="e.g. 10:00 AM"
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Location (optional)</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Kyoto, Japan"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className={labelClass}>Description (optional)</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Details about this activity..."
            className="min-h-[100px] bg-white border border-neutral-200 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-xl p-4 text-sm font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 shadow-2xs resize-y"
          />
        </div>

        {formData.category === 'flight' && (
          <FlightDetailsFields
            value={flightDetails}
            onChange={setFlightDetails}
            disabled={mutation.isPending}
          />
        )}

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-emerald-100/60 mt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onClose}
            className="rounded-full h-10 px-5 font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 font-manrope"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending}
            className="rounded-full h-10 px-6 font-semibold shadow-md transition-all duration-200 active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white font-manrope"
          >
            {mutation.isPending ? 'Saving...' : 'Save Event'}
          </Button>
        </div>
      </form>
    </div>
  );
}
