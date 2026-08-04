import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Plus, Trash2, GripVertical, Pencil } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { AirplaneTakeOff01Icon, BedDoubleIcon, Bus01Icon, Activity01Icon } from '@hugeicons/core-free-icons';
import { EventInlineForm } from './event-inline-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { TemplateDay, TemplateEvent } from '@/types/models';
import { toast } from 'sonner';

interface Props {
  templateId: string;
  day: TemplateDay & { events: TemplateEvent[] };
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'flight':
      return <HugeiconsIcon icon={AirplaneTakeOff01Icon} className="w-4 h-4 text-emerald-600" />;
    case 'accommodation':
      return <HugeiconsIcon icon={BedDoubleIcon} className="w-4 h-4 text-emerald-600" />;
    case 'transport':
      return <HugeiconsIcon icon={Bus01Icon} className="w-4 h-4 text-emerald-600" />;
    case 'activity':
      return <HugeiconsIcon icon={Activity01Icon} className="w-4 h-4 text-emerald-600" />;
    case 'sightseeing':
      return <HugeiconsIcon icon={Activity01Icon} className="w-4 h-4 text-emerald-600" />;
    default:
      return <HugeiconsIcon icon={Activity01Icon} className="w-4 h-4 text-emerald-600" />;
  }
};

export function DaySectionBuilder({ templateId, day }: Props) {
  const queryClient = useQueryClient();
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [dayDeleteDialog, setDayDeleteDialog] = useState(false);
  const [eventDeleteDialog, setEventDeleteDialog] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: '',
  });

  const deleteDayMutation = useMutation({
    mutationFn: async () => {
      return (await fetcher(`/admin/templates/${templateId}/days/${day.id}`, {
        method: 'DELETE',
      })) as { error?: string };
    },
    onSuccess: (res) => {
      const response = res as { error?: string };
      if (response.error) throw new Error(response.error);
      toast.success('Day removed');
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      setDayDeleteDialog(false);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove day');
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return (await fetcher(`/admin/templates/${templateId}/events/${eventId}`, {
        method: 'DELETE',
      })) as { error?: string };
    },
    onSuccess: (res) => {
      const response = res as { error?: string };
      if (response.error) throw new Error(response.error);
      toast.success('Event removed');
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      setEventDeleteDialog({ isOpen: false, id: '' });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to remove event');
    },
  });

  return (
    <div className="rounded-[24px] border border-neutral-200/60 bg-white shadow-lg overflow-hidden transition-all duration-300">
      <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 p-4 md:px-6">
        <div className="flex items-center space-x-3">
          <div className="cursor-move p-1.5 hover:bg-neutral-200/50 rounded-lg transition-colors text-neutral-400 hover:text-neutral-600">
            <GripVertical className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold font-syne text-neutral-900">Day {day.dayNumber}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDayDeleteDialog(true)}
          disabled={deleteDayMutation.isPending}
          className="h-9 w-9 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </Button>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {day.events.length === 0 ? (
          <p className="text-[13px] text-neutral-400 italic text-center py-6 font-manrope">
            No events planned for this day yet.
          </p>
        ) : (
          <div className="space-y-4">
            {day.events.map((ev) => (
              <div key={ev.id}>
                {editingEventId === ev.id ? (
                  <EventInlineForm
                    templateId={templateId}
                    dayId={day.id}
                    existingEventCount={day.events.length}
                    event={ev}
                    onClose={() => setEditingEventId(null)}
                  />
                ) : (
                  <div className="flex items-start justify-between rounded-2xl border border-neutral-100 bg-neutral-50/30 p-4 hover:border-emerald-200 hover:bg-emerald-50/30 hover:shadow-sm transition-all duration-200 group">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 cursor-move text-neutral-300 group-hover:text-neutral-500 transition-colors">
                        <GripVertical className="h-4 w-4" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-emerald-100/50 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/50">
                        {getCategoryIcon(ev.category || 'activity')}
                      </div>
                      <div className="space-y-1.5 font-manrope">
                        <div className="font-bold text-neutral-900 text-[15px] flex items-center gap-2">
                          {ev.title}
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                            {ev.category}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-neutral-500">
                          {ev.time && (
                            <div className="flex items-center">
                              <Clock className="mr-1 h-3.5 w-3.5 text-neutral-400" />
                              {ev.time}
                            </div>
                          )}
                          {ev.location && (
                            <div className="flex items-center">
                              <MapPin className="mr-1 h-3.5 w-3.5 text-neutral-400" />
                              {ev.location}
                            </div>
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-[13px] text-neutral-600 font-medium mt-2 leading-relaxed">
                            {ev.description}
                          </p>
                        )}
                        
                        {ev.category === 'flight' && ev.flightDetails && (
                          <div className="mt-3 pt-3 border-t border-neutral-200/50 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-semibold text-neutral-500">
                            {ev.flightDetails.airline && <div>Airline: <span className="text-neutral-900">{ev.flightDetails.airline}</span></div>}
                            {ev.flightDetails.flightNumber && <div>Flight: <span className="text-neutral-900">{ev.flightDetails.flightNumber}</span></div>}
                            {ev.flightDetails.departureAirport && <div>Dep: <span className="text-neutral-900">{ev.flightDetails.departureAirport}</span></div>}
                            {ev.flightDetails.arrivalAirport && <div>Arr: <span className="text-neutral-900">{ev.flightDetails.arrivalAirport}</span></div>}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50"
                        onClick={() => setEditingEventId(ev.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-neutral-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setEventDeleteDialog({ isOpen: true, id: ev.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isAddingEvent ? (
          <EventInlineForm
            templateId={templateId}
            dayId={day.id}
            existingEventCount={day.events.length}
            onClose={() => setIsAddingEvent(false)}
          />
        ) : (
          <Button
            variant="outline"
            className="w-full mt-4 border-dashed border-2 border-neutral-200 hover:border-emerald-300 hover:bg-emerald-50 text-neutral-500 hover:text-emerald-700 h-11 rounded-xl font-semibold font-manrope transition-colors"
            onClick={() => setIsAddingEvent(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event to Day {day.dayNumber}
          </Button>
        )}
      </div>

      <ConfirmDialog
        isOpen={dayDeleteDialog}
        title="Delete Day"
        description={`Are you sure you want to permanently delete Day ${day.dayNumber}? All events in this day will also be deleted.`}
        variant="destructive"
        isLoading={deleteDayMutation.isPending}
        onConfirm={() => deleteDayMutation.mutate()}
        onCancel={() => setDayDeleteDialog(false)}
      />

      <ConfirmDialog
        isOpen={eventDeleteDialog.isOpen}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
        variant="destructive"
        isLoading={deleteEventMutation.isPending}
        onConfirm={() => deleteEventMutation.mutate(eventDeleteDialog.id)}
        onCancel={() => setEventDeleteDialog({ isOpen: false, id: '' })}
      />
    </div>
  );
}
