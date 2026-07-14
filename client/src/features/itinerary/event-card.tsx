import { format } from 'date-fns';
import {
  Plane,
  Hotel,
  Utensils,
  Activity,
  Car,
  HelpCircle,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ItineraryEvent, EventCategory } from '@/types/models';

interface EventCardProps {
  event: ItineraryEvent;
  isOrganizerOrMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

export function EventCard({
  event,
  isOrganizerOrMember,
  onEdit,
  onDelete,
  isDragging,
}: EventCardProps) {
  const getIcon = (category: EventCategory) => {
    switch (category) {
      case 'flight':
        return <Plane className="h-5 w-5 text-blue-500" />;
      case 'hotel':
        return <Hotel className="h-5 w-5 text-indigo-500" />;
      case 'restaurant':
        return <Utensils className="h-5 w-5 text-orange-500" />;
      case 'activity':
        return <Activity className="h-5 w-5 text-green-500" />;
      case 'transport':
        return <Car className="h-5 w-5 text-yellow-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const startTime = format(new Date(event.startAt), 'h:mm a');
  const endTime = event.endAt ? format(new Date(event.endAt), 'h:mm a') : null;

  return (
    <Card
      className={`relative group transition-colors ${isDragging ? 'opacity-50 ring-2 ring-primary' : 'hover:border-primary/50'}`}
    >
      <CardContent className="p-4 flex gap-4">
        {isOrganizerOrMember && (
          <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-muted-foreground/30 group-hover:text-muted-foreground transition-colors -ml-2 drag-handle">
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        <div className="flex flex-col items-center justify-start pt-1 min-w-[60px]">
          {getIcon(event.category)}
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg">{event.title}</h4>
              <p className="text-sm text-muted-foreground font-medium">
                {startTime} {endTime && `- ${endTime}`}
              </p>
            </div>

            {isOrganizerOrMember && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Event
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete Event
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {(event.location || event.notes || event.flightDetails) && (
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              {event.location && (
                <p>
                  <strong className="text-foreground">Location:</strong> {event.location}
                </p>
              )}
              {event.notes && <p className="whitespace-pre-wrap">{event.notes}</p>}

              {event.flightDetails && (
                <div className="bg-muted/30 rounded p-3 mt-2 grid grid-cols-2 gap-2 text-xs">
                  {event.flightDetails.airline && (
                    <div>
                      <strong>Airline:</strong> {event.flightDetails.airline}
                    </div>
                  )}
                  {event.flightDetails.flightNumber && (
                    <div>
                      <strong>Flight:</strong> {event.flightDetails.flightNumber}
                    </div>
                  )}
                  {event.flightDetails.departureAirport && (
                    <div>
                      <strong>Dep:</strong> {event.flightDetails.departureAirport}
                    </div>
                  )}
                  {event.flightDetails.arrivalAirport && (
                    <div>
                      <strong>Arr:</strong> {event.flightDetails.arrivalAirport}
                    </div>
                  )}
                  {event.flightDetails.terminal && (
                    <div>
                      <strong>Terminal:</strong> {event.flightDetails.terminal}
                    </div>
                  )}
                  {event.flightDetails.gate && (
                    <div>
                      <strong>Gate:</strong> {event.flightDetails.gate}
                    </div>
                  )}
                  {event.flightDetails.seat && (
                    <div>
                      <strong>Seat:</strong> {event.flightDetails.seat}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
