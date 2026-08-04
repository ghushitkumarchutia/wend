import type { Template } from '@/types/models';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar02Icon,
  UserGroupIcon,
  Copy01Icon,
  SparklesIcon,
} from '@hugeicons/core-free-icons';

interface TemplateCardProps {
  template: Template;
  onClick: (template: Template) => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const defaultCover =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=90';

  const rawCover = template.coverImageUrl || defaultCover;
  const coverUrl = rawCover.includes('images.unsplash.com')
    ? rawCover.includes('w=')
      ? rawCover.replace(/w=\d+/, 'w=1920').replace(/q=\d+/, 'q=90')
      : `${rawCover}${rawCover.includes('?') ? '&' : '?'}auto=format&fit=crop&w=1920&q=90`
    : rawCover;

  const minGroup = template.recommendedGroupSizeMin || 1;
  const maxGroup = template.recommendedGroupSizeMax;
  const groupText = maxGroup ? `${minGroup}-${maxGroup}` : `${minGroup}+`;

  return (
    <div
      onClick={() => onClick(template)}
      className="group block relative w-full aspect-video rounded-[24px] overflow-hidden border border-black/5 shadow-[0_13px_27px_-5px_rgba(50,50,93,0.25),0_8px_16px_-8px_rgba(0,0,0,0.3)] select-none cursor-pointer hover:scale-[1.004] transition-transform duration-300 ease-out"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={coverUrl}
          alt={template.title}
          className="w-full h-full object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-black/35 z-10" />

      <div className="relative z-20 h-full w-full p-4.5 md:p-5 flex flex-col justify-between font-manrope">
        <div className="flex gap-1.5 justify-end">
          {template.visibility === 'featured' && (
            <span className="inline-flex items-center gap-1 px-2 md:px-2.5 py-1 md:py-1.25 text-[8px] md:text-[10.5px] font-medium font-manrope rounded-full bg-amber-500/80 backdrop-blur-md text-white border border-amber-300/30 leading-none">
              <HugeiconsIcon icon={SparklesIcon} className="size-2.5 md:size-3 text-white" />
              <span className="translate-y-[-0.5px]">Featured</span>
            </span>
          )}
          {template.categories?.[0] && (
            <span className="inline-flex items-center px-2 md:px-2.5 py-1 md:py-1.25 text-[8px] md:text-[10.5px] font-light font-manrope rounded-full bg-white/20 backdrop-blur-md text-white border border-white/10 leading-none">
              <span className="translate-y-[-0.5px]">{capitalize(template.categories[0])}</span>
            </span>
          )}
        </div>

        <div className="flex flex-col text-left space-y-2 md:space-y-2.5">
          <div className="md:space-y-0.5">
            <h3 className="text-[20px] md:text-[28px] font-bold text-white font-syne leading-tight line-clamp-1 tracking-tight">
              {template.title}
            </h3>
            <p className="text-[12px] md:text-xs font-normal text-white/90 font-manrope tracking-wide line-clamp-1">
              {template.destination}
            </p>
          </div>

          <div className="flex flex-row md:flex-col flex-wrap gap-1.5 md:pt-0.5">
            {template.bestSeason && template.bestSeason.length > 0 && (
              <div className="inline-flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-1.25 rounded-[10px] md:rounded-[12px] bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] md:text-[11px] font-light font-manrope tracking-wide w-max leading-none">
                <HugeiconsIcon
                  icon={Calendar02Icon}
                  className="size-2.75 md:size-3.5 text-white/90 shrink-0"
                  strokeWidth={1.75}
                />
                <span className="md:translate-y-[-0.5px]">
                  {template.bestSeason[0]}
                  {template.bestSeason.length > 1 ? ' & more' : ''}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <div className="inline-flex items-center gap-1 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.25 rounded-[10px] md:rounded-[12px] bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] md:text-[11px] font-light font-manrope tracking-wide w-max leading-none">
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  className="size-2.75 md:size-3.5 text-white/90 shrink-0"
                  strokeWidth={1.75}
                />
                <span className="md:translate-y-[-0.5px]">{groupText} travelers</span>
              </div>

              <div className="inline-flex items-center gap-1 md:gap-2 px-2.5 md:px-3 py-1 md:py-1.25 rounded-[10px] md:rounded-[12px] bg-white/20 backdrop-blur-md text-white border border-white/10 text-[9px] md:text-[11px] font-light font-manrope tracking-wide w-max leading-none">
                <HugeiconsIcon
                  icon={Copy01Icon}
                  className="size-2.75 md:size-3.5 text-white/90 shrink-0"
                  strokeWidth={1.75}
                />
                <span className="md:translate-y-[-0.5px]">
                  {template.cloneCount} {template.cloneCount === 1 ? 'clone' : 'clones'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
