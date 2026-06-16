import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';

interface TemplateSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function TemplateSearchBar({ value, onChange, placeholder = 'Search templates...' }: TemplateSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        className="h-10 w-full rounded-full bg-background pl-10 pr-10 shadow-xs focus-visible:ring-primary/20"
      />
      {localValue && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute right-2 top-1/2 size-6 -translate-y-1/2 rounded-full text-muted-foreground hover:bg-muted"
          onClick={() => {
            setLocalValue('');
            onChange('');
          }}
        >
          <X className="size-3" />
          <span className="sr-only">Clear</span>
        </Button>
      )}
    </div>
  );
}
