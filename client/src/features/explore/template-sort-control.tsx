import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sorting01Icon } from '@hugeicons/core-free-icons';

interface TemplateSortControlProps {
  value: string;
  onChange: (val: string) => void;
}

export function TemplateSortControl({ value, onChange }: TemplateSortControlProps) {
  const getSortLabel = () => {
    switch (value) {
      case 'popular':
        return 'Most Popular';
      case 'newest':
        return 'Newest First';
      case 'featured':
        return 'Featured First';
      default:
        return 'Most Popular';
    }
  };

  const sortItems = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' },
    { value: 'featured', label: 'Featured First' },
  ];

  return (
    <Select value={value} onValueChange={(val) => onChange(val as string)}>
      <SelectTrigger className="w-full md:w-auto min-w-45 h-10! md:h-11! px-3.5 md:px-4.5 bg-white! border border-black/5 focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! rounded-full text-xs md:text-sm font-manrope font-semibold text-neutral-800 shadow-[0_8px_30px_rgb(0,0,0,0.08)] cursor-pointer hover:border-black/20! transition-colors duration-200 active:scale-[0.985] flex items-center justify-between gap-2.5 select-none">
        <div className="flex items-center gap-2 truncate">
          <HugeiconsIcon
            icon={Sorting01Icon}
            className="size-4 md:size-4.5 text-emerald-600 shrink-0"
            strokeWidth={2}
          />
          <span className="text-neutral-400 font-medium text-xs">Sort:</span>
          <span className="text-neutral-900 font-syne font-bold text-xs md:text-sm truncate">
            {getSortLabel()}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-2xl bg-white/95 backdrop-blur-md ring-0! border-none! shadow-2xl p-1.5 overflow-y-auto max-h-56 font-manrope z-50">
        {sortItems.map((item) => {
          const isSelected = item.value === value;
          return (
            <SelectItem
              key={item.value}
              value={item.value}
              className={`rounded-xl transition-all cursor-pointer py-2 px-3 my-0.5 font-manrope text-xs md:text-sm font-medium ${
                isSelected
                  ? 'text-emerald-700! hover:text-emerald-700! focus:text-emerald-700! focus:bg-emerald-50! hover:bg-emerald-50! font-semibold border border-emerald-200/50'
                  : 'hover:bg-slate-50! focus:bg-slate-50! hover:text-emerald-600! focus:text-emerald-600! text-neutral-800'
              }`}
              style={
                isSelected
                  ? {
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, #D1FAE5 100%)',
                      boxShadow: `
                        inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.95),
                        inset 0 -1px 2px 0 rgba(0, 0, 0, 0.05),
                        0 2px 8px -2px rgba(16, 185, 129, 0.2)
                      `,
                    }
                  : undefined
              }
            >
              {item.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
