import { useState } from 'react';
import { format } from 'date-fns';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AirplaneTakeOff01Icon,
  SpeedTrain01Icon,
  BedDoubleIcon,
  Pulse01Icon,
  Dish01Icon,
  Note05Icon,
  Location06Icon,
  ArrowDown01Icon,
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Delete01Icon,
} from '@hugeicons/core-free-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ItineraryEvent, EventCategory } from '@/types/models';
import tabSvg from '@/assets/svg/tab.svg';

interface EventCardProps {
  event: ItineraryEvent;
  isOrganizerOrMember: boolean;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

function getCategoryTheme(category: EventCategory) {
  switch (category) {
    case 'flight':
      return {
        cardBg: '#FFFFFF',
        categoryBg: '#E2F0FF',
        pillBorder: 'rgba(37, 99, 235, 0.25)',
        accent: '#2563EB',
        icon: (
          <HugeiconsIcon
            icon={AirplaneTakeOff01Icon}
            className="size-2.25 md:size-3 block"
            color="#2563EB"
            strokeWidth={2}
          />
        ),
      };
    case 'hotel':
      return {
        cardBg: '#FFFFFF',
        categoryBg: '#F0E9FF',
        pillBorder: 'rgba(109, 40, 217, 0.25)',
        accent: '#6D28D9',
        icon: (
          <HugeiconsIcon
            icon={BedDoubleIcon}
            className="size-2.25 md:size-[11.4px] block"
            color="#6D28D9"
            strokeWidth={2}
          />
        ),
      };
    case 'restaurant':
      return {
        cardBg: '#FFFFFF',
        categoryBg: '#FFEAD9',
        pillBorder: 'rgba(234, 88, 12, 0.25)',
        accent: '#EA580C',
        icon: (
          <HugeiconsIcon
            icon={Dish01Icon}
            className="size-2.25 md:size-[11.8px] block"
            color="#EA580C"
            strokeWidth={2}
          />
        ),
      };
    case 'transport':
      return {
        cardBg: '#FFFFFF',
        categoryBg: '#E0F5EA',
        pillBorder: 'rgba(21, 128, 61, 0.25)',
        accent: '#059669',
        icon: (
          <HugeiconsIcon
            icon={SpeedTrain01Icon}
            className="size-2.25 md:size-2.75 block"
            color="#059669"
            strokeWidth={2}
          />
        ),
      };
    case 'activity':
      return {
        cardBg: '#FFFFFF',
        categoryBg: '#FEF3C7',
        pillBorder: 'rgba(217, 119, 6, 0.25)',
        accent: '#D97706',
        icon: (
          <HugeiconsIcon
            icon={Pulse01Icon}
            className="size-2.25 md:size-3 block"
            color="#D97706"
            strokeWidth={2}
          />
        ),
      };
    case 'other':
    default:
      return {
        cardBg: '#FFFFFF',
        categoryBg: '#ECECF0',
        pillBorder: 'rgba(100, 116, 139, 0.25)',
        accent: '#4B5563',
        icon: (
          <HugeiconsIcon
            icon={Note05Icon}
            className="size-2.25 md:size-[11.5px] block"
            color="#4B5563"
            strokeWidth={2}
          />
        ),
      };
  }
}

const formatEventTime = (isoString?: string | null): string | undefined => {
  if (!isoString) return undefined;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return undefined;
    return format(d, 'h:mm a');
  } catch {
    return undefined;
  }
};

export function EventCard({
  event,
  isOrganizerOrMember,
  onEdit,
  onDelete,
  isDragging,
}: EventCardProps) {
  const [showFlightDetails, setShowFlightDetails] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const theme = getCategoryTheme(event?.category || 'other');
  const startTime = formatEventTime(event?.startAt);
  const endTime = formatEventTime(event?.endAt);

  return (
    <div className="relative w-full h-full mt-5 md:mt-6.75">
      <div
        aria-hidden="true"
        className="absolute -top-5.5 md:-top-6.75 left-0 h-6.25 md:h-7.5 w-48 md:w-58.75 max-w-[70%] pointer-events-none z-10"
        style={{
          backgroundColor: '#FFFFFF',
          WebkitMaskImage: `url(${tabSvg})`,
          maskImage: `url(${tabSvg})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'left top',
          maskPosition: 'left top',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }}
      />

      <div className="absolute -top-2.75 md:-top-3.5 left-2.5 md:left-3.5 z-20 pointer-events-none select-none">
        <div
          className="relative inline-flex items-center justify-center gap-1 md:gap-1.5 px-1.75 sm:px-2.25 md:px-2.5 py-1 md:py-1 rounded-full border border-white/90 backdrop-blur-md transition-all"
          style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${theme.categoryBg} 100%)`,
            boxShadow: `
              inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
              inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
              0 4px 12px -2px rgba(0, 0, 0, 0.08),
              0 1px 3px 0 ${theme.pillBorder}
            `,
          }}
        >
          <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

          <div className="relative z-10 flex items-center justify-center shrink-0">
            {theme.icon}
          </div>

          <span
            className="font-syne text-[8px] md:text-[9.5px] font-semibold uppercase tracking-wider leading-none relative z-10 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
            style={{ color: theme.accent }}
          >
            {event?.category || 'other'}
          </span>
        </div>
      </div>

      <div
        className={`relative w-full rounded-3xl rounded-tl-none p-1 bg-white shadow-2xs flex flex-col justify-start cursor-pointer select-none ${
          isDragging ? 'opacity-50 ring-2 ring-sky-500 z-30' : ''
        }`}
      >
        <div
          className="w-full rounded-2xl px-2.5 md:px-3 pt-3.5 md:pt-4 pb-2.5 md:pb-3.5 space-y-2 flex flex-col justify-start transition-colors"
          style={{
            background: `linear-gradient(to top, ${theme.categoryBg} 0%, #FFFFFF 100%)`,
          }}
        >
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-syne font-semibold text-neutral-900 text-sm md:text-[16px] tracking-wide truncate leading-snug">
                  {event?.title || 'Untitled Event'}
                </h4>
                {(startTime || endTime) && (
                  <p className="font-manrope font-medium text-[10px] md:text-[11px] text-neutral-500 tracking-wide">
                    {startTime} {endTime && `- ${endTime}`}
                  </p>
                )}
              </div>

              {isOrganizerOrMember && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/5 transition-colors focus-visible:outline-none h-6 w-6 md:h-7 md:w-7 p-0 shrink-0 cursor-pointer mt-[-2.5px] md:mt-[-2.7px]">
                    <span className="sr-only">Open menu</span>
                    <HugeiconsIcon
                      icon={MoreHorizontalCircle01Icon}
                      className="size-4 md:size-4.5 block"
                      strokeWidth={1.5}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-auto min-w-0 bg-white/95 backdrop-blur-md border border-black/5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-full p-1 z-50 flex items-center gap-0.5"
                  >
                    <DropdownMenuItem
                      onClick={onEdit}
                      className="rounded-full px-1.5 py-1 text-neutral-600 hover:text-neutral-900 hover:bg-black/5 focus:bg-black/5 focus:text-neutral-900 cursor-pointer transition-colors flex items-center justify-center shrink-0"
                      title="Edit Event"
                    >
                      <HugeiconsIcon
                        icon={PencilEdit02Icon}
                        className="size-4 block"
                        strokeWidth={1.5}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="rounded-full px-1.5 py-1 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer transition-colors flex items-center justify-center shrink-0"
                      title="Delete Event"
                    >
                      <HugeiconsIcon
                        icon={Delete01Icon}
                        className="size-4 block"
                        strokeWidth={1.5}
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {(event?.location || event?.notes || event?.flightDetails) && (
              <div className="pt-0.5 space-y-2 text-xs md:text-sm font-manrope">
                {event?.location && (
                  <div className="flex items-start gap-1 min-w-0 text-[11px] md:text-xs text-neutral-700 font-medium font-manrope">
                    <HugeiconsIcon
                      icon={Location06Icon}
                      className="size-3 md:size-3.25 shrink-0 block ml-[-0.5px] mt-[2.5px]"
                      color={theme.accent}
                      strokeWidth={2}
                    />
                    <span className="line-clamp-2 wrap-break-word leading-snug font-manrope">
                      {event.location}
                    </span>
                  </div>
                )}

                {event?.notes && (
                  <div className="mt-2.5 font-manrope">
                    <div
                      className="relative w-full rounded-[13px] border border-white/90 backdrop-blur-md transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${theme.categoryBg} 100%)`,
                        boxShadow: `
                          inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                          inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
                          0 4px 12px -2px rgba(0, 0, 0, 0.08),
                          0 1px 3px 0 ${theme.pillBorder}
                        `,
                      }}
                    >
                      <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowNotes((prev) => !prev);
                        }}
                        className="w-full flex items-center justify-between px-2.25 md:px-2.5 py-1.25 md:py-2 cursor-pointer group focus:outline-none"
                      >
                        <span
                          className="text-[8.5px] md:text-[11.5px] font-medium tracking-tight relative z-10 font-syne"
                          style={{ color: theme.accent }}
                        >
                          {showNotes ? 'Hide Description' : 'View Description'}
                        </span>

                        <div
                          className="w-4 h-4 md:w-4.5 md:h-4.5 rounded-full bg-white flex items-center justify-center shrink-0 relative z-10 group-hover:scale-105 transition-transform"
                          style={{
                            boxShadow: `
                              inset 0 -1px 2px rgba(0, 0, 0, 0.1),
                              inset 0 1px 2px rgba(255, 255, 255, 1),
                              0 2px 5px rgba(0, 0, 0, 0.12)
                            `,
                          }}
                        >
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className={`size-2.5 md:size-3 block transition-transform duration-200 ${showNotes ? 'rotate-180' : ''}`}
                            color={theme.accent}
                            strokeWidth={2.25}
                          />
                        </div>
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-in-out ${
                          showNotes
                            ? 'grid-rows-[1fr] opacity-100 px-2 md:px-2.5 pb-2.5 md:pb-3 pt-0.5'
                            : 'grid-rows-[0fr] opacity-0 px-2 md:px-2.5 py-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="bg-white/85 backdrop-blur-sm rounded-xl p-2.5 md:p-3 text-xs border border-white/80 shadow-2xs">
                            <span className="text-[8px] md:text-[10px] font-bold text-neutral-400 uppercase tracking-widest block mb-1">
                              Description
                            </span>
                            <p className="text-neutral-700 font-normal text-[10px] md:text-xs leading-relaxed font-manrope">
                              {event.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {event?.flightDetails && (
                  <div className="mt-2.5 font-manrope">
                    <div
                      className="relative w-full rounded-[13px] border border-white/90 backdrop-blur-md transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${theme.categoryBg} 100%)`,
                        boxShadow: `
                          inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                          inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
                          0 4px 12px -2px rgba(0, 0, 0, 0.08),
                          0 1px 3px 0 ${theme.pillBorder}
                        `,
                      }}
                    >
                      <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowFlightDetails((prev) => !prev);
                        }}
                        className="w-full flex items-center justify-between px-2.25 md:px-2.5 py-1.25 md:py-2 cursor-pointer group focus:outline-none"
                      >
                        <span
                          className="text-[8.5px] md:text-[11.5px] font-medium tracking-tight relative z-10 font-syne"
                          style={{ color: theme.accent }}
                        >
                          {showFlightDetails ? 'Hide Flight Details' : 'View Flight Details'}
                        </span>

                        <div
                          className="w-4 h-4 md:w-4.5 md:h-4.5 rounded-full bg-white flex items-center justify-center shrink-0 relative z-10 group-hover:scale-105 transition-transform"
                          style={{
                            boxShadow: `
                              inset 0 -1px 2px rgba(0, 0, 0, 0.1),
                              inset 0 1px 2px rgba(255, 255, 255, 1),
                              0 2px 5px rgba(0, 0, 0, 0.12)
                            `,
                          }}
                        >
                          <HugeiconsIcon
                            icon={ArrowDown01Icon}
                            className={`size-2.5 md:size-3 block transition-transform duration-200 ${showFlightDetails ? 'rotate-180' : ''}`}
                            color={theme.accent}
                            strokeWidth={2.25}
                          />
                        </div>
                      </button>

                      <div
                        className={`grid transition-[grid-template-rows,opacity,padding] duration-300 ease-in-out ${
                          showFlightDetails
                            ? 'grid-rows-[1fr] opacity-100 px-2 md:px-2.5 pb-2 md:pb-2.5 pt-0.5'
                            : 'grid-rows-[0fr] opacity-0 px-2 md:px-2.5 py-0'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="bg-white rounded-lg p-2.5 md:p-3 grid grid-cols-2 gap-x-3.5 gap-y-2.5 text-xs border border-black/5 shadow-2xs">
                            {event.flightDetails.airline && (
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[8px] md:text-[9.5px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  Airline
                                </span>
                                <strong className="text-neutral-800 font-semibold text-[9.5px] md:text-[11.5px] truncate font-manrope">
                                  {event.flightDetails.airline}
                                </strong>
                              </div>
                            )}
                            {event.flightDetails.flightNumber && (
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[8px] md:text-[9.5px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  Flight
                                </span>
                                <strong className="text-neutral-800 font-semibold text-[9.5px] md:text-[11.5px] truncate font-manrope">
                                  {event.flightDetails.flightNumber}
                                </strong>
                              </div>
                            )}
                            {event.flightDetails.departureAirport && (
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[8px] md:text-[9.5px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  Dep Airport
                                </span>
                                <strong className="text-neutral-800 font-semibold text-[9.5px] md:text-[11.5px] line-clamp-2 wrap-break-word leading-tight font-manrope">
                                  {event.flightDetails.departureAirport}
                                </strong>
                              </div>
                            )}
                            {event.flightDetails.arrivalAirport && (
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[8px] md:text-[9.5px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  Arr Airport
                                </span>
                                <strong className="text-neutral-800 font-semibold text-[9.5px] md:text-[11.5px] line-clamp-2 wrap-break-word leading-tight font-manrope">
                                  {event.flightDetails.arrivalAirport}
                                </strong>
                              </div>
                            )}
                            {event.flightDetails.terminal && (
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[8px] md:text-[9.5px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  Terminal
                                </span>
                                <strong className="text-neutral-800 font-semibold text-[9.5px] md:text-[11.5px] truncate font-manrope">
                                  {event.flightDetails.terminal}
                                </strong>
                              </div>
                            )}
                            {event.flightDetails.gate && (
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[8px] md:text-[9.5px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  Gate
                                </span>
                                <strong className="text-neutral-800 font-semibold text-[9.5px] md:text-[11.5px] truncate font-manrope">
                                  {event.flightDetails.gate}
                                </strong>
                              </div>
                            )}
                            {event.flightDetails.seat && (
                              <div className="min-w-0 flex flex-col justify-center">
                                <span className="text-[8px] md:text-[9.5px] font-semibold text-neutral-400 uppercase tracking-wider block mb-0.5">
                                  Seat
                                </span>
                                <strong className="text-neutral-800 font-semibold text-[9.5px] md:text-[11.5px] truncate font-manrope">
                                  {event.flightDetails.seat}
                                </strong>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
