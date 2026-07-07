import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Clock, MapPin, Plus, Trash2, GripVertical, Pencil } from 'lucide-react';
import { EventInlineForm } from './event-inline-form';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { TemplateDay, TemplateEvent } from '@/types/models';
import { toast } from 'sonner';

interface Props {
  templateId: string;
  day: TemplateDay & { events: TemplateEvent[] };
}

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
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center space-x-4">
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
          <h3 className="text-lg font-semibold">Day {day.dayNumber}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDayDeleteDialog(true)}
          disabled={deleteDayMutation.isPending}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {day.events.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-4">
            No events planned for this day yet.
          </p>
        ) : (
          <div className="space-y-3">
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
                  <div className="flex items-start justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors group">
                    <div className="space-y-1">
                      <div className="font-medium flex items-center">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {ev.title}
                      </div>
                      {ev.time && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {ev.time}
                        </div>
                      )}
                      {ev.location && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="mr-1 h-3 w-3" />
                          {ev.location}
                        </div>
                      )}
                      {ev.description && (
                        <p className="text-sm text-muted-foreground mt-2">{ev.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditingEventId(ev.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEventDeleteDialog({ isOpen: true, id: ev.id })}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
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
            size="sm"
            className="w-full mt-2 border-dashed"
            onClick={() => setIsAddingEvent(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Event
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
