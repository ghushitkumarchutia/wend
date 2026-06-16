import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface CategoryFilterChipsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
  className?: string;
}

export function CategoryFilterChips({
  categories,
  selectedCategory,
  onSelect,
  className,
}: CategoryFilterChipsProps) {
  return (
    <ScrollArea className={cn('w-full whitespace-nowrap', className)}>
      <div className="flex w-max items-center space-x-2 p-1">
        <Badge
          variant={selectedCategory === null ? 'default' : 'secondary'}
          className="cursor-pointer rounded-full px-4 py-1.5 transition-colors"
          onClick={() => onSelect(null)}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'secondary'}
            className="cursor-pointer rounded-full px-4 py-1.5 transition-colors hover:bg-primary/80 hover:text-primary-foreground"
            onClick={() => onSelect(selectedCategory === category ? null : category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="hidden" />
    </ScrollArea>
  );
}
