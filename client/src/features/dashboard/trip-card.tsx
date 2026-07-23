import { Link } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
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

  const defaultCover =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=90';

  const rawCover = trip.coverImageUrl || defaultCover;
  const coverUrl = rawCover.includes('images.unsplash.com')
    ? rawCover.includes('w=')
      ? rawCover.replace(/w=\d+/, 'w=1920').replace(/q=\d+/, 'q=90')
      : `${rawCover}${rawCover.includes('?') ? '&' : '?'}auto=format&fit=crop&w=1920&q=90`
    : rawCover;

  return (
    <Link
      to="/trips/$tripId"
      params={{ tripId: trip.id }}
      className="group block relative w-full aspect-3/4 rounded-[24px] overflow-hidden shadow-md shadow-neutral-200/40 select-none cursor-pointer hover:scale-[1.004] transition-transform duration-300 ease-out"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img src={coverUrl} alt={trip.name} className="w-full h-full object-cover object-center" />
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/35 z-10" />

      <div className="relative z-20 h-full w-full p-4.5 md:p-5 flex flex-col justify-between font-manrope">
        <div className="flex gap-1.5 justify-end">
          <span className="inline-flex items-center px-2.5 py-1.25 text-[10.5px] font-light font-manrope rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 leading-none">
            <span className="translate-y-[-0.5px]">{capitalize(trip.status)}</span>
          </span>
          <span className="inline-flex items-center px-2.5 py-1.25 text-[10.5px] font-light font-manrope rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 leading-none">
            <span className="translate-y-[-0.5px]">{capitalize(trip.role)}</span>
          </span>
        </div>

        <div className="flex flex-col text-left space-y-2.5">
          <div className="space-y-0.5">
            <h3 className="text-2xl lg:text-[22px] font-bold text-white font-syne leading-tight line-clamp-1 tracking-tight">
              {trip.name}
            </h3>
            <p className="text-sm lg:text-xs font-normal text-white/90 font-manrope tracking-wide line-clamp-1">
              {trip.destination}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 pt-0.5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[12px] bg-white/20 backdrop-blur-md text-white border border-white/10 text-xs font-light font-manrope tracking-wide w-max leading-none">
              <HugeiconsIcon
                icon={Calendar02Icon}
                className="size-3.5 text-white/90 shrink-0"
                strokeWidth={1.75}
              />
              <span className="-translate-y-px">
                {formattedStartDate} - {formattedEndDate}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[12px] bg-white/20 backdrop-blur-md text-white border border-white/10 text-xs font-light font-manrope tracking-wide w-max leading-none">
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="size-3.5 text-white/90 shrink-0"
                strokeWidth={1.75}
              />
              <span className="-translate-y-px">
                {trip.memberCount} traveler{trip.memberCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
