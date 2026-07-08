import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterChipsProps {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
}

export function CategoryFilterChips({ categories, selectedCategory, onSelect }: CategoryFilterChipsProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-2 p-1">
        <Badge
          variant={selectedCategory === null ? 'default' : 'outline'}
          className="cursor-pointer transition-colors"
          onClick={() => onSelect(null)}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            className="cursor-pointer transition-colors capitalize"
            onClick={() => onSelect(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
      <ScrollBar orientation="horizontal" className="invisible" />
    </ScrollArea>
  );
}
