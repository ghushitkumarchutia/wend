import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TemplateSortControlProps {
  value: string;
  onChange: (val: string) => void;
}

export function TemplateSortControl({ value, onChange }: TemplateSortControlProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as string)}>
      <SelectTrigger className="w-[180px] bg-background">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="popular">Most Popular</SelectItem>
        <SelectItem value="featured">Featured First</SelectItem>
      </SelectContent>
    </Select>
  );
}
