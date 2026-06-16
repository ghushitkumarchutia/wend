import { ArrowDownUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TemplateSortControlProps {
  sort: string;
  onChange: (sort: string) => void;
}

export function TemplateSortControl({ sort, onChange }: TemplateSortControlProps) {
  return (
    <div className="flex items-center gap-2">
      <ArrowDownUp className="size-4 text-muted-foreground" />
      <Select value={sort} onValueChange={onChange}>
        <SelectTrigger className="w-[160px] h-9 bg-background">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="shortest">Duration: Short to Long</SelectItem>
          <SelectItem value="longest">Duration: Long to Short</SelectItem>
          <SelectItem value="budget_low">Budget: Low to High</SelectItem>
          <SelectItem value="budget_high">Budget: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
