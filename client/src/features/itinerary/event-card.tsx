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
  const getCategoryTheme = (category: EventCategory) => {
    switch (category) {
      case 'flight':
        return {
          bg: 'bg-sky-500/10 text-sky-600',
          labelColor: 'text-sky-600',
          icon: <Plane className="h-5 w-5 text-sky-600 stroke-1" />,
        };
      case 'hotel':
        return {
          bg: 'bg-indigo-500/10 text-indigo-600',
          labelColor: 'text-indigo-600',
          icon: <Hotel className="h-5 w-5 text-indigo-600 stroke-1" />,
        };
      case 'restaurant':
        return {
          bg: 'bg-amber-500/10 text-amber-600',
          labelColor: 'text-amber-600',
          icon: <Utensils className="h-5 w-5 text-amber-600 stroke-1" />,
        };
      case 'activity':
        return {
          bg: 'bg-emerald-500/10 text-[#09a474]',
          labelColor: 'text-[#09a474]',
          icon: <Activity className="h-5 w-5 text-[#09a474] stroke-1" />,
        };
      case 'transport':
        return {
          bg: 'bg-purple-500/10 text-purple-600',
          labelColor: 'text-purple-600',
          icon: <Car className="h-5 w-5 text-purple-600 stroke-1" />,
        };
      default:
        return {
          bg: 'bg-slate-500/10 text-slate-600',
          labelColor: 'text-slate-600',
          icon: <HelpCircle className="h-5 w-5 text-slate-600 stroke-1" />,
        };
    }
  };

  const theme = getCategoryTheme(event.category);
  const startTime = format(new Date(event.startAt), 'h:mm a');
  const endTime = event.endAt ? format(new Date(event.endAt), 'h:mm a') : null;

  return (
    <Card
      className={`relative group transition-all duration-200 ring-0 border border-neutral-200/70 rounded-xl bg-white shadow-2xs overflow-hidden cursor-pointer ${
        isDragging ? 'opacity-50 ring-0 ring-[#09a474]' : 'hover:border-neutral-300 rounded-xl'
      }`}
    >
      <CardContent className="pt-1.5 pb-3 px-4 sm:pt-2 sm:pb-3.5 sm:px-5 flex items-start gap-3 sm:gap-4">
        {isOrganizerOrMember && (
          <div className="flex items-center justify-center cursor-grab active:cursor-grabbing text-neutral-300 group-hover:text-neutral-500 transition-colors self-center drag-handle -ml-1 shrink-0">
            <GripVertical className="h-5 w-5 stroke-1" />
          </div>
        )}

        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg ${theme.bg} flex items-center justify-center shrink-0`}
        >
          {theme.icon}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-semibold text-neutral-900 text-base sm:text-[17px] tracking-tight truncate leading-snug">
                {event.title}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-400 font-normal mt-0.5">
                {startTime} {endTime && `- ${endTime}`}
              </p>
            </div>

            {isOrganizerOrMember && (
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 transition-colors focus-visible:outline-none h-7 w-7 p-0 shrink-0 cursor-pointer -mt-0.5">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-5 w-5 stroke-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-44 bg-white/90 backdrop-blur-md border border-neutral-200/40 rounded-xl shadow-md p-1.5 z-50 flex flex-col gap-y-1"
                >
                  <DropdownMenuItem
                    onClick={onEdit}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 hover:bg-[#09a474]/10 hover:text-[#09a474] focus:bg-[#09a474]/10 focus:text-[#09a474] [&_svg]:text-neutral-500! hover:[&_svg]:text-[#09a474]! focus:[&_svg]:text-[#09a474]! cursor-pointer transition-all duration-200 flex items-center whitespace-nowrap"
                  >
                    <Pencil className="mr-2.5 h-4 w-4 shrink-0 stroke-1" />
                    <span>Edit Event</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={onDelete}
                    variant="destructive"
                    className="rounded-lg px-3 py-2 text-sm font-semibold bg-red-500! hover:bg-red-600! focus:bg-red-600! text-white! hover:text-white! focus:text-white! [&_svg]:text-white! hover:[&_svg]:text-white! focus:[&_svg]:text-white! cursor-pointer transition-all duration-200 flex items-center whitespace-nowrap"
                  >
                    <Trash className="mr-2.5 h-4 w-4 shrink-0 stroke-1 text-white! stroke-white!" />
                    <span className="text-white!">Delete Event</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {(event.location || event.notes || event.flightDetails) && (
            <div className="pt-0.5 space-y-1 text-xs sm:text-sm">
              {event.location && (
                <p className="truncate text-neutral-500 font-normal">
                  <strong className={`font-semibold ${theme.labelColor}`}>Location: </strong>
                  {event.location}
                </p>
              )}
              {event.notes && (
                <p className="text-neutral-400 font-light line-clamp-2 leading-relaxed">
                  {event.notes}
                </p>
              )}

              {event.flightDetails && (
                <div className="bg-[#F6F6F6] rounded-xl p-3 mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-neutral-600 font-medium border border-neutral-200/50">
                  {event.flightDetails.airline && (
                    <div>
                      <span className="text-neutral-400 font-normal">Airline: </span>
                      {event.flightDetails.airline}
                    </div>
                  )}
                  {event.flightDetails.flightNumber && (
                    <div>
                      <span className="text-neutral-400 font-normal">Flight: </span>
                      {event.flightDetails.flightNumber}
                    </div>
                  )}
                  {event.flightDetails.departureAirport && (
                    <div>
                      <span className="text-neutral-400 font-normal">Dep: </span>
                      {event.flightDetails.departureAirport}
                    </div>
                  )}
                  {event.flightDetails.arrivalAirport && (
                    <div>
                      <span className="text-neutral-400 font-normal">Arr: </span>
                      {event.flightDetails.arrivalAirport}
                    </div>
                  )}
                  {event.flightDetails.terminal && (
                    <div>
                      <span className="text-neutral-400 font-normal">Terminal: </span>
                      {event.flightDetails.terminal}
                    </div>
                  )}
                  {event.flightDetails.gate && (
                    <div>
                      <span className="text-neutral-400 font-normal">Gate: </span>
                      {event.flightDetails.gate}
                    </div>
                  )}
                  {event.flightDetails.seat && (
                    <div>
                      <span className="text-neutral-400 font-normal">Seat: </span>
                      {event.flightDetails.seat}
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
