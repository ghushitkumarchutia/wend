import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EventCard } from './event-card';
import { itineraryApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { ItineraryEvent } from '@/types/models';
import { AddEditEventModal } from './add-edit-event-modal';
import { DeleteEventDialog } from './delete-event-dialog';

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
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);

  if (
    localEvents.length > 0 &&
    events.length > 0 &&
    localEvents[0].id !== events[0].id &&
    !draggedId
  ) {
    setLocalEvents(events);
  }

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    if (!isOrganizerOrMember) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';

    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    if (e.dataTransfer.setDragImage) {
      const clone = target.cloneNode(true) as HTMLElement;
      clone.style.position = 'absolute';
      clone.style.top = '-9999px';
      clone.style.left = '-9999px';
      clone.style.width = `${rect.width}px`;
      clone.style.borderRadius = '12px';
      clone.style.opacity = '0.95';
      clone.style.boxShadow = '0 12px 30px -10px rgba(0, 0, 0, 0.12)';
      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, offsetX, offsetY);
      setTimeout(() => {
        if (document.body.contains(clone)) {
          document.body.removeChild(clone);
        }
      }, 0);
    }
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

  const handleConfirmDelete = async () => {
    if (!deletingEventId) return;
    try {
      await itineraryApi.deleteEvent(tripId, deletingEventId);
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['itinerary', tripId] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete event';
      toast.error(msg);
      throw error;
    }
  };

  const activeDeletingEvent = events.find((e) => e.id === deletingEventId);

  return (
    <div className="space-y-3">
      {localEvents.map((event) => (
        <div
          key={event.id}
          draggable={isOrganizerOrMember}
          onDragStart={(e) => handleDragStart(e, event.id)}
          onDragOver={(e) => handleDragOver(e, event.id)}
          onDragEnd={handleDragEnd}
          className="transition-transform duration-150 ease-in-out"
        >
          <EventCard
            event={event}
            isOrganizerOrMember={isOrganizerOrMember}
            isDragging={draggedId === event.id}
            onEdit={() => setEditingEventId(event.id)}
            onDelete={() => setDeletingEventId(event.id)}
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

      {deletingEventId && activeDeletingEvent && (
        <DeleteEventDialog
          eventTitle={activeDeletingEvent.title}
          open={!!deletingEventId}
          onOpenChange={(open) => !open && setDeletingEventId(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
