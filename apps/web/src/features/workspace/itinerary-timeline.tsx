import { useMemo, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Link } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { DaySection } from '@/features/workspace/day-section';
import { EventModal } from '@/features/workspace/event-modal';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import type { TripWithRole, MemberWithUser, ItineraryEventWithDetails } from '@wend/shared';
import type { DragEndEvent } from '@dnd-kit/core';

interface ItineraryTimelineProps {
  trip: TripWithRole;
  members: MemberWithUser[];
  currentUserId: string;
}

export function ItineraryTimeline({ trip, members, currentUserId }: ItineraryTimelineProps) {
  const queryClient = useQueryClient();
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ItineraryEventWithDetails | null>(null);
  const [defaultDate, setDefaultDate] = useState<Date | undefined>(undefined);
  const [deleteTarget, setDeleteTarget] = useState<ItineraryEventWithDetails | null>(null);

  const eventsQuery = useQuery({
    queryKey: ['trips', trip.id, 'itinerary'],
    queryFn: () =>
      api.get<{ data: ItineraryEventWithDetails[] }>(`/api/v1/trips/${trip.id}/itinerary`),
  });

  const deleteMutation = useMutation({
    mutationFn: (eventId: string) =>
      api.delete(`/api/v1/trips/${trip.id}/itinerary/${eventId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'itinerary'] });
      setDeleteTarget(null);
      toast.success('Event deleted');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (event: ItineraryEventWithDetails) =>
      api.patch(`/api/v1/trips/${trip.id}/itinerary/${event.id}`, {
        status: 'confirmed',
        version: event.version,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'itinerary'] });
      toast.success('Event restored');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (events: { id: string; order: number }[]) =>
      api.put(`/api/v1/trips/${trip.id}/itinerary/reorder`, { events }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'itinerary'] });
    },
  });

  const debouncedReorder = useDebouncedCallback(
    (events: { id: string; order: number }[]) => {
      reorderMutation.mutate(events);
    },
    500,
  );

  const tripStart = startOfDay(new Date(trip.startDate));
  const tripEnd = startOfDay(new Date(trip.endDate));

  const { dayMap, outsideEvents } = useMemo(() => {
    const events = eventsQuery.data?.data ?? [];
    const map = new Map<string, ItineraryEventWithDetails[]>();
    const outside: ItineraryEventWithDetails[] = [];

    for (const event of events) {
      const eventDate = startOfDay(new Date(event.startAt));
      if (isBefore(eventDate, tripStart) || isAfter(eventDate, tripEnd)) {
        outside.push(event);
      } else {
        const k = eventDate.toISOString();
        if (!map.has(k)) map.set(k, []);
        map.get(k)!.push(event);
      }
    }

    for (const dayEvents of map.values()) {
      dayEvents.sort((a, b) => a.order - b.order);
    }

    return { dayMap: map, outsideEvents: outside };
  }, [eventsQuery.data, tripStart, tripEnd]);

  const tripDays = useMemo(() => {
    const days: Date[] = [];
    let current = tripStart;
    while (!isAfter(current, tripEnd)) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  }, [tripStart, tripEnd]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      for (const [, dayEvents] of dayMap) {
        const activeIndex = dayEvents.findIndex((e) => e.id === active.id);
        const overIndex = dayEvents.findIndex((e) => e.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1) {
          const reordered = arrayMove(dayEvents, activeIndex, overIndex);
          const updates = reordered.map((e, i) => ({ id: e.id, order: i + 1 }));

          queryClient.setQueryData(
            ['trips', trip.id, 'itinerary'],
            (old: { data: ItineraryEventWithDetails[] } | undefined) => {
              if (!old) return old;
              const updated = old.data.map((evt) => {
                const update = updates.find((u) => u.id === evt.id);
                return update ? { ...evt, order: update.order } : evt;
              });
              return { data: updated };
            },
          );

          debouncedReorder(updates);
          break;
        }
      }
    },
    [dayMap, queryClient, trip.id, debouncedReorder],
  );

  function handleAddEvent(date: Date) {
    setEditingEvent(null);
    setDefaultDate(date);
    setEventModalOpen(true);
  }

  function handleEditEvent(event: ItineraryEventWithDetails) {
    setEditingEvent(event);
    setDefaultDate(undefined);
    setEventModalOpen(true);
  }

  if (eventsQuery.isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="ml-11 h-24 w-full rounded-lg" />
            <Skeleton className="ml-11 h-24 w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (eventsQuery.isError) {
    return (
      <ErrorState
        message="Couldn't load the itinerary."
        onRetry={() => eventsQuery.refetch()}
      />
    );
  }

  return (
    <>
      {trip.role === 'viewer' && (
        <div className="mb-4 rounded-md border bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          You&apos;re a Viewer on this trip — you can see the itinerary but can&apos;t make changes.
        </div>
      )}

      {outsideEvents.length > 0 && (
        <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            <span className="text-sm font-medium">Events outside trip dates</span>
            <Badge variant="secondary" className="ml-1">
              {outsideEvents.length}
            </Badge>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            These events fall outside the current trip date range.{' '}
            {trip.role === 'organizer' && (
              <Link to="/trips/$tripId" params={{ tripId: trip.id }} className="text-primary underline-offset-4 hover:underline">
                Edit trip dates
              </Link>
            )}
          </p>
          <div className="space-y-2">
            {outsideEvents.map((event) => (
              <div key={event.id} className="text-sm">
                <span className="font-medium">{event.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {new Date(event.startAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="space-y-8">
          {tripDays.map((day) => {
            const dayKey = startOfDay(day).toISOString();
            const dayEvents = dayMap.get(dayKey) ?? [];
            return (
              <DaySection
                key={dayKey}
                date={day}
                events={dayEvents}
                members={members}
                currentUserId={currentUserId}
                userRole={trip.role}
                onAddEvent={handleAddEvent}
                onEditEvent={handleEditEvent}
                onDeleteEvent={setDeleteTarget}
                onRestoreEvent={(e) => restoreMutation.mutate(e)}
              />
            );
          })}
        </div>
      </DndContext>

      <EventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        tripId={trip.id}
        event={editingEvent}
        defaultDate={defaultDate}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete event"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
      />
    </>
  );
}
