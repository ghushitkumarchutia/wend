import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';

interface TemplateSearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function TemplateSearchBar({
  value,
  onChange,
  placeholder = 'Search templates by title or destination...',
}: TemplateSearchBarProps) {
  return (
    <div className="relative w-full max-w-xl group">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-neutral-400 group-focus-within:text-emerald-500 transition-colors z-10" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-11 pr-10 bg-white/90 backdrop-blur-xl border border-white/50 focus-visible:ring-2! focus-visible:ring-emerald-500/30! focus-visible:border-emerald-500! rounded-full h-12 md:h-13 text-sm md:text-base font-manrope font-semibold text-neutral-900 placeholder:text-neutral-400 placeholder:font-normal transition-all duration-300 shadow-[0_10px_35px_-5px_rgba(0,0,0,0.25)]"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-all z-10 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
