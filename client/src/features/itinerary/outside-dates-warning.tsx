import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar02Icon } from '@hugeicons/core-free-icons';
import type { ItineraryEvent } from '@/types/models';

interface OutsideDatesWarningProps {
  events: ItineraryEvent[];
  tripStartDate: string;
  tripEndDate: string;
}

export function OutsideDatesWarning({
  events,
  tripStartDate,
  tripEndDate,
}: OutsideDatesWarningProps) {
  const start = new Date(tripStartDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(tripEndDate);
  end.setHours(23, 59, 59, 999);

  const outsideEvents = events.filter((event) => {
    const eventDate = new Date(event.startAt);
    return eventDate < start || eventDate > end;
  });

  if (outsideEvents.length === 0) {
    return null;
  }

  const count = outsideEvents.length;

  return (
    <div
      className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-amber-200/90 backdrop-blur-md p-3.5 md:p-4.5 flex items-start gap-3.5 transition-all duration-300 font-manrope mb-4"
      style={{
        background:
          'linear-gradient(135deg, rgba(254, 243, 199, 0.6) 0%, rgba(253, 230, 138, 0.35) 100%)',
        boxShadow: `
          inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.9),
          inset 0 -1px 2px 0 rgba(217, 119, 6, 0.08),
          0 4px 14px -2px rgba(217, 119, 6, 0.12),
          0 1px 3px 0 rgba(0, 0, 0, 0.04)
        `,
      }}
    >
      <div className="size-9 md:size-10 rounded-xl md:rounded-2xl bg-amber-500/15 border border-amber-400/40 flex items-center justify-center shrink-0 shadow-2xs">
        <HugeiconsIcon
          icon={Calendar02Icon}
          className="size-4.5 md:size-5 text-amber-700"
          strokeWidth={1.75}
        />
      </div>

      <div className="space-y-1 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h5 className="font-syne font-bold text-sm md:text-base text-amber-950 tracking-tight">
            Events Outside Trip Dates
          </h5>
          <span className="px-2 py-0.5 rounded-full bg-amber-600/15 border border-amber-600/20 text-amber-900 text-[10px] md:text-xs font-bold font-manrope">
            {count} {count === 1 ? 'Event' : 'Events'}
          </span>
        </div>
        <p className="text-amber-900/80 font-normal text-xs md:text-sm leading-relaxed font-manrope">
          You have {count} event{count === 1 ? '' : 's'} scheduled outside the official trip dates.
          They appear in the itinerary timeline below for your reference.
        </p>
      </div>
    </div>
  );
}
