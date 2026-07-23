import { useState } from 'react';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon } from '@hugeicons/core-free-icons';
import { SortableEventList } from './sortable-event-list';
import type { ItineraryEvent } from '@/types/models';

interface DaySectionProps {
  tripId: string;
  dateStr: string;
  dayNumber: number;
  events: ItineraryEvent[];
  isOrganizerOrMember: boolean;
}

export function DaySection({
  tripId,
  dateStr,
  dayNumber,
  events,
  isOrganizerOrMember,
}: DaySectionProps) {
  const [visibleCount, setVisibleCount] = useState(6);

  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const formattedDate = format(dateObj, 'EEEE, MMMM d');

  const visibleEvents = events.slice(0, visibleCount);
  const remainingCount = events.length - visibleCount;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2.5 md:gap-3">
        <div className="inline-flex items-baseline gap-1.5 px-3 py-1 rounded-full bg-white border border-black/5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] select-none shrink-0">
          {dayNumber >= 1 ? (
            <>
              <span className="font-manrope text-[10px] md:text-sm font-bold uppercase tracking-wider text-emerald-700/80">
                Day
              </span>
              <span className="font-manrope text-[10px] md:text-sm font-medium text-emerald-600 leading-none">
                {dayNumber}
              </span>
            </>
          ) : (
            <span className="font-manrope text-xs md:text-sm font-bold text-emerald-600">
              Outside Trip Dates
            </span>
          )}
        </div>
        <span className="w-px h-3.5 bg-neutral-200 shrink-0" />
        <h3 className="font-manrope text-xs md:text-sm font-semibold text-neutral-700 tracking-wide whitespace-nowrap">
          {formattedDate}
        </h3>
        <div className="flex-1 h-px bg-linear-to-r from-neutral-200/90 via-neutral-200/40 to-transparent" />
      </div>

      {events.length === 0 ? (
        <div
          className="w-full py-4 md:py-5 px-6 text-center bg-white/70 backdrop-blur-md border border-dashed border-neutral-200/90 rounded-2xl md:rounded-3xl shadow-2xs flex items-center justify-center gap-2 text-neutral-400/90 font-normal text-xs md:text-sm font-manrope tracking-normal select-none"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8), 0 2px 8px rgba(0, 0, 0, 0.03)',
          }}
        >
          <HugeiconsIcon
            icon={Calendar02Icon}
            className="size-3.5 md:size-4 text-neutral-400/80 shrink-0"
            strokeWidth={1.5}
          />
          <span>No events scheduled for this day.</span>
        </div>
      ) : (
        <div className="space-y-6">
          <SortableEventList
            tripId={tripId}
            events={visibleEvents}
            isOrganizerOrMember={isOrganizerOrMember}
          />

          {remainingCount > 0 && (
            <div className="flex justify-center pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="bg-white hover:bg-neutral-50 text-neutral-800 font-medium border border-neutral-200/80 rounded-xl px-5 h-10 text-xs md:text-sm shadow-2xs transition-all duration-200 cursor-pointer flex items-center gap-2"
              >
                <span>
                  Show {Math.min(remainingCount, 6)} More Event
                  {Math.min(remainingCount, 6) === 1 ? '' : 's'} ({remainingCount} remaining)
                </span>
                <ChevronDown className="h-4 w-4 text-neutral-500" />
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
