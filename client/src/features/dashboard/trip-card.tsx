import { Link } from '@tanstack/react-router';
import { Calendar, Users } from 'lucide-react';
import type { TripWithRole } from '@/types/models';
import { format } from 'date-fns';

interface TripCardProps {
  trip: TripWithRole;
}

export function TripCard({ trip }: TripCardProps) {
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const formattedStartDate = format(new Date(trip.startDate), 'MMM d, yyyy');
  const formattedEndDate = format(new Date(trip.endDate), 'MMM d, yyyy');

  return (
    <Link
      to="/trips/$tripId"
      params={{ tripId: trip.id }}
      className="group block relative w-full aspect-3/4 rounded-[24px] overflow-hidden shadow-md shadow-neutral-200/40 select-none cursor-pointer"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        {trip.coverImageUrl ? (
          <img
            src={trip.coverImageUrl}
            alt={trip.name}
            className="w-full h-full object-cover scale-[1.12] transition-transform duration-500 ease-out group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-neutral-900 scale-[1.12] transition-transform duration-500 ease-out group-hover:scale-100">
            <span className="text-5xl">✈️</span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/35 z-10" />

      <div className="relative z-20 h-full w-full p-5 flex flex-col justify-between">
        <div className="flex gap-2 justify-end">
          <span className="px-3.5 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-[0_2px_10px_0_rgba(0,0,0,0.05)]">
            {capitalize(trip.status)}
          </span>
          <span className="px-3.5 py-1 text-xs font-semibold rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 shadow-[0_2px_10px_0_rgba(0,0,0,0.05)]">
            {capitalize(trip.role)}
          </span>
        </div>

        <div className="flex flex-col text-left space-y-3">
          <div className="space-y-1">
            <h3 className="text-[22px] font-semibold text-white tracking-tight leading-tight line-clamp-1 drop-shadow-sm font-sans">
              {trip.name}
            </h3>
            <p className="text-sm font-normal text-white/90 tracking-wide line-clamp-1 drop-shadow-sm font-sans">
              {trip.destination}
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[14px] bg-white/20 backdrop-blur-md text-white border border-white/10 text-[11px] font-medium tracking-wide w-max shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-white/90" />
              <span>
                {formattedStartDate} - {formattedEndDate}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[14px] bg-white/20 backdrop-blur-md text-white border border-white/10 text-[11px] font-medium tracking-wide w-max shadow-sm">
              <Users className="h-3.5 w-3.5 text-white/90" />
              <span>
                {trip.memberCount} traveler{trip.memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
