import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { EventCard } from '@/features/workspace/event-card';
import type { ItineraryEventWithDetails, MemberWithUser } from '@wend/shared';

interface DaySectionProps {
  date: Date;
  events: ItineraryEventWithDetails[];
  members: MemberWithUser[];
  currentUserId: string;
  userRole: 'organizer' | 'member' | 'viewer';
  onAddEvent: (date: Date) => void;
  onEditEvent: (event: ItineraryEventWithDetails) => void;
  onDeleteEvent: (event: ItineraryEventWithDetails) => void;
  onRestoreEvent: (event: ItineraryEventWithDetails) => void;
}

function SortableEventCard({
  event,
  members,
  currentUserId,
  userRole,
  onEdit,
  onDelete,
  onRestore,
}: {
  event: ItineraryEventWithDetails;
  members: MemberWithUser[];
  currentUserId: string;
  userRole: 'organizer' | 'member' | 'viewer';
  onEdit: (event: ItineraryEventWithDetails) => void;
  onDelete: (event: ItineraryEventWithDetails) => void;
  onRestore: (event: ItineraryEventWithDetails) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <EventCard
        event={event}
        members={members}
        currentUserId={currentUserId}
        userRole={userRole}
        onEdit={onEdit}
        onDelete={onDelete}
        onRestore={onRestore}
        dragAttributes={attributes}
        dragListeners={userRole !== 'viewer' ? listeners : undefined}
        isDragging={isDragging}
      />
    </div>
  );
}

export function DaySection({
  date,
  events,
  members,
  currentUserId,
  userRole,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onRestoreEvent,
}: DaySectionProps) {
  const isViewer = userRole === 'viewer';
  const eventIds = events.map((e) => e.id);

  return (
    <div className="relative">
      <div className="absolute bottom-0 left-4 top-10 w-px bg-border" />

      <div className="mb-3 flex items-center gap-3">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {format(date, 'd')}
        </div>
        <h3 className="text-sm font-semibold">{format(date, 'EEEE, d MMM yyyy')}</h3>
      </div>

      <div className="space-y-3 pl-11">
        {!isViewer && events.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={() => onAddEvent(date)}
          >
            <Plus className="mr-1 size-3" />
            Add Event
          </Button>
        )}

        {events.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nothing planned for this day yet. Add an event to get started.
            </p>
            {!isViewer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddEvent(date)}
              >
                <Plus className="mr-1.5 size-3.5" />
                Add Event
              </Button>
            )}
          </div>
        ) : (
          <SortableContext items={eventIds} strategy={verticalListSortingStrategy}>
            {events.map((event) => (
              <SortableEventCard
                key={event.id}
                event={event}
                members={members}
                currentUserId={currentUserId}
                userRole={userRole}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                onRestore={onRestoreEvent}
              />
            ))}
          </SortableContext>
        )}

        {!isViewer && events.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            className="text-muted-foreground"
            onClick={() => onAddEvent(date)}
          >
            <Plus className="mr-1 size-3" />
            Add Event
          </Button>
        )}
      </div>
    </div>
  );
}
