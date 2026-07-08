import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EventCard } from './event-card';
import { itineraryApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { ItineraryEvent } from '@/types/models';
import { AddEditEventModal } from './add-edit-event-modal';

interface SortableEventListProps {
  tripId: string;
  events: ItineraryEvent[];
  isOrganizerOrMember: boolean;
}

export function SortableEventList({ tripId, events, isOrganizerOrMember }: SortableEventListProps) {
  const queryClient = useQueryClient();
  const [localEvents, setLocalEvents] = useState(events);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  if (
    localEvents.length > 0 &&
    events.length > 0 &&
    localEvents[0].id !== events[0].id &&
    !draggedId
  ) {
    setLocalEvents(events);
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!isOrganizerOrMember) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId || !isOrganizerOrMember) return;

    const draggedIndex = localEvents.findIndex((ev) => ev.id === draggedId);
    const targetIndex = localEvents.findIndex((ev) => ev.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1) return;

    const newEvents = [...localEvents];
    const [removed] = newEvents.splice(draggedIndex, 1);
    newEvents.splice(targetIndex, 0, removed);

    setLocalEvents(newEvents);
  };

  const handleDragEnd = async () => {
    if (!draggedId || !isOrganizerOrMember) return;
    setDraggedId(null);

    const isChanged = localEvents.some((ev, idx) => ev.id !== events[idx]?.id);
    if (!isChanged) return;

    const reorderedPayload = localEvents.map((ev, index) => ({
      id: ev.id,
      order: index * 10,
    }));

    try {
      await itineraryApi.reorderEvents(tripId, { events: reorderedPayload });
      toast.success('Itinerary updated');
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
    } catch {
      toast.error('Failed to save event order');
      setLocalEvents(events);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      await itineraryApi.deleteEvent(tripId, eventId);
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete event';
      toast.error(msg);
    }
  };

  return (
    <div className="space-y-3">
      {localEvents.map((event) => (
        <div
          key={event.id}
          draggable={isOrganizerOrMember}
          onDragStart={(e) => handleDragStart(e, event.id)}
          onDragOver={(e) => handleDragOver(e, event.id)}
          onDragEnd={handleDragEnd}
        >
          <EventCard
            event={event}
            isOrganizerOrMember={isOrganizerOrMember}
            isDragging={draggedId === event.id}
            onEdit={() => setEditingEventId(event.id)}
            onDelete={() => handleDelete(event.id)}
          />
        </div>
      ))}

      {editingEventId && (
        <AddEditEventModal
          tripId={tripId}
          event={events.find((e) => e.id === editingEventId)}
          open={!!editingEventId}
          onOpenChange={(open) => !open && setEditingEventId(null)}
          tripStartDate={events[0]?.startAt || ''}
        />
      )}
    </div>
  );
}
