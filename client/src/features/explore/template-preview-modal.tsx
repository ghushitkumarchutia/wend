import { useQuery } from '@tanstack/react-query';
import { exploreApi } from '@/lib/api-client';
import type { Template } from '@/types/models';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Users, Calendar, Info, Map } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AirplaneTakeOff01Icon,
  SpeedTrain01Icon,
  BedDoubleIcon,
  Pulse01Icon,
  Dish01Icon,
  Note05Icon,
} from '@hugeicons/core-free-icons';
import tabSvg from '@/assets/svg/tab.svg';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onCloneClick: (template: Template) => void;
}

function getCategoryTheme(category: string) {
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
    case 'accommodation':
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
    case 'food':
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
    case 'sightseeing':
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

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onCloneClick,
}: TemplatePreviewModalProps) {
  const { data: detailResponse, isLoading } = useQuery({
    queryKey: ['template-detail', template?.id],
    queryFn: () => exploreApi.getTemplate(template!.id),
    enabled: !!template?.id && isOpen,
  });

  const fullTemplate = detailResponse?.data;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-lg md:max-w-xl w-full max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0 rounded-[24px] md:rounded-[32px] border-0 shadow-2xl bg-white"
      >
        {!template ? null : (
          <div className="flex flex-col h-full overflow-y-auto w-full relative">
            {/* Top Image Section */}
            <div className="relative w-full aspect-video shrink-0">
              {template.coverImageUrl ? (
                <img
                  src={template.coverImageUrl}
                  alt={template.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                  <MapPin className="h-16 w-16 text-neutral-400" />
                </div>
              )}

              {/* Gradient overlays for readability */}
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

              {/* Difficulty Badge */}
              {template.difficultyLevel && (
                <div className="absolute top-3.5 right-3.5 md:top-4 md:right-4 z-20">
                  <span className="inline-flex items-center px-2.5 md:px-3 py-1 md:py-1.25 text-[9px] md:text-[11.5px] font-light font-manrope rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 leading-none">
                    <span className="translate-y-[-0.5px]">
                      {template.difficultyLevel.charAt(0).toUpperCase() +
                        template.difficultyLevel.slice(1)}
                    </span>
                  </span>
                </div>
              )}

              {/* Title and Metadata */}
              <div className="absolute bottom-4 left-4 right-4 md:bottom-5 md:left-5 md:right-5 z-20 flex flex-col items-start gap-2 md:gap-2.5 font-manrope">
                <h2 className="text-[20px] md:text-[28px] font-bold text-white font-syne leading-tight tracking-tight drop-shadow-sm">
                  {template.title}
                </h2>

                <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                  {/* Location Pill */}
                  <div className="inline-flex items-center gap-1 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.25 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] md:text-[11.5px] font-light font-manrope tracking-wide leading-none">
                    <MapPin className="size-2.75 md:size-3.5 text-white/90 shrink-0" />
                    <span className="translate-y-[-0.5px]">{template.destination}</span>
                  </div>

                  {/* Group Size Pill */}
                  {(template.recommendedGroupSizeMin || template.recommendedGroupSizeMax) && (
                    <div className="inline-flex items-center gap-1 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.25 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] md:text-[11.5px] font-light font-manrope tracking-wide leading-none">
                      <Users className="size-2.75 md:size-3.5 text-white/90 shrink-0" />
                      <span className="translate-y-[-0.5px]">
                        Group: {template.recommendedGroupSizeMin || 1}
                        {template.recommendedGroupSizeMax
                          ? `-${template.recommendedGroupSizeMax}`
                          : '+'}
                      </span>
                    </div>
                  )}

                  {/* Season Pill */}
                  {template.bestSeason && template.bestSeason.length > 0 && (
                    <div className="inline-flex items-center gap-1 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.25 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] md:text-[11.5px] font-light font-manrope tracking-wide leading-none">
                      <Calendar className="size-2.75 md:size-3.5 text-white/90 shrink-0" />
                      <span className="translate-y-[-0.5px]">
                        Best in:{' '}
                        {template.bestSeason
                          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                          .join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white p-6 md:p-8 space-y-3.5 border-b border-black/5">
              <h3 className="font-syne font-bold text-lg md:text-xl text-neutral-900 flex items-center gap-2">
                <Info className="h-5 w-5 text-emerald-600" />
                About this trip
              </h3>
              <p className="text-sm md:text-base text-neutral-500 font-manrope whitespace-pre-wrap leading-relaxed max-w-4xl">
                {template.description}
              </p>
            </div>

            {/* Itinerary Preview Section */}
            <div className="bg-[#E5E7EB]/50 w-full min-h-100 p-6 md:p-8 pb-32">
              <h3 className="font-syne font-bold text-xl md:text-2xl text-neutral-900 flex items-center gap-2.5 mb-8">
                <Map className="h-6 w-6 md:h-7 md:w-7 text-neutral-700" strokeWidth={1.5} />
                Itinerary Preview
              </h3>

              {isLoading ? (
                <div className="flex items-center justify-center py-12 text-neutral-400">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : !fullTemplate?.days || fullTemplate.days.length === 0 ? (
                <div className="text-center py-12 text-neutral-400 font-manrope border border-dashed border-neutral-300 rounded-2xl bg-white/50">
                  No itinerary details available for this template.
                </div>
              ) : (
                <div className="space-y-8 md:space-y-10">
                  {fullTemplate.days
                    .sort((a, b) => a.dayNumber - b.dayNumber)
                    .map((day) => (
                      <div key={day.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
                          <h4 className="font-syne font-bold text-xl md:text-[22px] text-neutral-900">
                            Day {day.dayNumber}
                          </h4>
                          <span className="text-xs md:text-[13px] font-medium text-neutral-500 font-manrope">
                            {day.events?.length || 0} events
                          </span>
                        </div>

                        {!day.events || day.events.length === 0 ? (
                          <div className="py-4 text-sm text-neutral-400 italic font-manrope pl-2">
                            Free day
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-5">
                            {day.events
                              .sort((a, b) => a.order - b.order)
                              .map((event) => {
                                const theme = getCategoryTheme(event.category || 'other');

                                return (
                                  <div
                                    key={event.id}
                                    className="relative w-full h-full mt-4 md:mt-5"
                                  >
                                    <div
                                      aria-hidden="true"
                                      className="absolute -top-5.5 md:-top-5.25 left-[0.7px] h-6.25 md:h-7.5 w-48 md:w-58.75 max-w-[70%] pointer-events-none z-10"
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
                                          {event.category || 'other'}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="relative w-full h-full rounded-3xl rounded-tl-none p-1 bg-white shadow-2xs flex flex-col justify-start select-none border border-black/5">
                                      <div
                                        className="w-full h-full rounded-2xl px-3 md:px-4 pt-4 md:pt-5 pb-3 md:pb-4 flex flex-col justify-start"
                                        style={{
                                          background: `linear-gradient(to top, ${theme.categoryBg} 0%, #FFFFFF 100%)`,
                                        }}
                                      >
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-syne font-semibold text-neutral-900 text-[15px] md:text-[16px] tracking-wide truncate leading-snug">
                                            {event.title}
                                          </h4>
                                          {event.time && (
                                            <p className="font-manrope font-medium text-[11px] md:text-xs text-neutral-500 tracking-wide mt-1">
                                              {event.time}
                                            </p>
                                          )}
                                          {event.location && (
                                            <p className="font-manrope font-medium text-[11px] md:text-xs text-neutral-500 tracking-wide mt-1 flex items-center gap-1 line-clamp-1">
                                              <MapPin className="h-3 w-3 shrink-0" />
                                              <span className="truncate">{event.location}</span>
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Fixed Bottom Action Bar */}
            <div className="sticky bottom-0 left-0 right-0 border-t border-neutral-200/60 bg-white px-6 md:px-8 py-4 md:py-5 flex flex-col items-center gap-4 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.06)] z-30">
              <div className="flex gap-3 md:gap-4 w-full justify-center max-w-md mx-auto">
                <Button
                  variant="waterdrop"
                  onClick={onClose}
                  className="flex-1 h-11 md:h-12 text-sm md:text-[15px] font-bold font-syne tracking-wide text-white border border-white/35 cursor-pointer rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #F85252 0%, #E63946 100%)',
                    boxShadow: `
                      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                      inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                      0 4px 14px -2px rgba(230, 57, 70, 0.4),
                      0 1px 3px 0 rgba(0, 0, 0, 0.08)
                    `,
                  }}
                >
                  Cancel
                </Button>

                <Button
                  variant="waterdrop"
                  onClick={() => onCloneClick(template)}
                  className="flex-1 h-11 md:h-12 text-sm md:text-[15px] font-bold font-syne tracking-wide text-white border border-white/35 cursor-pointer rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    boxShadow: `
                      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                      inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                      0 4px 14px -2px rgba(16, 185, 129, 0.4),
                      0 1px 3px 0 rgba(0, 0, 0, 0.08)
                    `,
                  }}
                >
                  Use Template
                </Button>
              </div>

              <div className="text-[13px] md:text-sm font-manrope font-medium text-neutral-400 tracking-wide text-center">
                {template.cloneCount || 0} travelers have cloned this
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
