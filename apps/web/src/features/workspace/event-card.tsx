import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Plane,
  BedDouble,
  Utensils,
  Compass,
  Car,
  CircleDot,
  MapPin,
  Pencil,
  MoreVertical,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ItineraryEventWithDetails, MemberWithUser } from '@wend/shared';
import type { EventCategory, EventStatus } from '@wend/shared';
import type { LucideIcon } from 'lucide-react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

interface EventCardProps {
  event: ItineraryEventWithDetails;
  members: MemberWithUser[];
  currentUserId: string;
  userRole: 'organizer' | 'member' | 'viewer';
  onEdit?: (event: ItineraryEventWithDetails) => void;
  onDelete?: (event: ItineraryEventWithDetails) => void;
  onRestore?: (event: ItineraryEventWithDetails) => void;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  isDragging?: boolean;
}

const CATEGORY_CONFIG: Record<EventCategory, { icon: LucideIcon; label: string }> = {
  flight: { icon: Plane, label: 'Flight' },
  hotel: { icon: BedDouble, label: 'Hotel' },
  restaurant: { icon: Utensils, label: 'Restaurant' },
  activity: { icon: Compass, label: 'Activity' },
  transport: { icon: Car, label: 'Transport' },
  other: { icon: CircleDot, label: 'Other' },
};

const STATUS_STYLES: Record<EventStatus, string> = {
  confirmed: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  tentative: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  cancelled: 'bg-red-500/10 text-red-700 dark:text-red-400',
};

function getTimeDisplay(event: ItineraryEventWithDetails): string {
  const start = new Date(event.startAt);
  const timeStr = format(start, 'HH:mm');

  if (!event.endAt) return timeStr;

  const end = new Date(event.endAt);
  return `${timeStr} – ${format(end, 'HH:mm')}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function EventCard({
  event,
  members,
  currentUserId,
  userRole,
  onEdit,
  onDelete,
  onRestore,
  dragAttributes,
  dragListeners,
  isDragging,
}: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const categoryConfig = CATEGORY_CONFIG[event.category];
  const CategoryIcon = categoryConfig.icon;
  const isCreator = event.createdByUserId === currentUserId;
  const isOrganizer = userRole === 'organizer';
  const canEdit = isCreator || isOrganizer;
  const canDelete = isCreator || isOrganizer;
  const isViewer = userRole === 'viewer';
  const isCancelled = event.status === 'cancelled';

  const creator = members.find((m) => m.userId === event.createdByUserId);
  const creatorName = creator?.user.name ?? 'Unknown';

  return (
    <div
      className={`group relative rounded-lg border bg-card p-4 transition-shadow hover:shadow-sm ${isDragging ? 'shadow-md opacity-80' : ''} ${isCancelled ? 'opacity-60' : ''}`}
      {...dragAttributes}
      {...dragListeners}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <CategoryIcon className="size-4 text-muted-foreground" />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="shrink-0 text-xs">
              {categoryConfig.label}
            </Badge>
            <Badge className={`shrink-0 text-xs ${STATUS_STYLES[event.status]}`}>
              {event.status}
            </Badge>
          </div>

          <h4 className={`font-medium ${isCancelled ? 'line-through' : ''}`}>
            {event.title}
          </h4>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{getTimeDisplay(event)}</span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                {event.location}
              </span>
            )}
          </div>

          {event.notes && (
            <div className="text-sm text-muted-foreground">
              {event.notes.length > 80 && !expanded ? (
                <>
                  {event.notes.slice(0, 80)}…{' '}
                  <button
                    type="button"
                    className="text-primary underline-offset-4 hover:underline"
                    onClick={() => setExpanded(true)}
                  >
                    Show more
                  </button>
                </>
              ) : (
                <>
                  {event.notes}
                  {event.notes.length > 80 && (
                    <>
                      {' '}
                      <button
                        type="button"
                        className="text-primary underline-offset-4 hover:underline"
                        onClick={() => setExpanded(false)}
                      >
                        Show less
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {event.category === 'flight' && event.flightDetails && (
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 rounded-md bg-muted/50 p-2 text-xs">
              {event.flightDetails.airline && (
                <span>
                  <span className="text-muted-foreground">Airline: </span>
                  {event.flightDetails.airline}
                </span>
              )}
              {event.flightDetails.flightNumber && (
                <span>
                  <span className="text-muted-foreground">Flight: </span>
                  {event.flightDetails.flightNumber}
                </span>
              )}
              {event.flightDetails.departureAirport && (
                <span>
                  <span className="text-muted-foreground">From: </span>
                  {event.flightDetails.departureAirport}
                </span>
              )}
              {event.flightDetails.arrivalAirport && (
                <span>
                  <span className="text-muted-foreground">To: </span>
                  {event.flightDetails.arrivalAirport}
                </span>
              )}
              {event.flightDetails.terminal && (
                <span>
                  <span className="text-muted-foreground">Terminal: </span>
                  {event.flightDetails.terminal}
                </span>
              )}
              {event.flightDetails.gate && (
                <span>
                  <span className="text-muted-foreground">Gate: </span>
                  {event.flightDetails.gate}
                </span>
              )}
              {event.flightDetails.seat && (
                <span>
                  <span className="text-muted-foreground">Seat: </span>
                  {event.flightDetails.seat}
                </span>
              )}
              {event.flightDetails.confirmationRef && (
                <span>
                  <span className="text-muted-foreground">Ref: </span>
                  {event.flightDetails.confirmationRef}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <Avatar size="sm">
              {creator?.user.image ? (
                <AvatarImage src={creator.user.image} alt={creatorName} />
              ) : null}
              <AvatarFallback>{getInitials(creatorName)}</AvatarFallback>
            </Avatar>
            <span>Added by {creatorName}</span>
            {event.updatedAt !== event.createdAt && (
              <span>
                · Edited {formatDistanceToNow(new Date(event.updatedAt), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        {!isViewer && (
          <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            {canEdit && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => onEdit?.(event)}
              >
                <Pencil className="size-3" />
              </Button>
            )}
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-xs">
                    <MoreVertical className="size-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isCancelled && (
                    <DropdownMenuItem onClick={() => onRestore?.(event)}>
                      <RotateCcw className="mr-2 size-3.5" />
                      Restore event
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete?.(event)}
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    Delete event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
