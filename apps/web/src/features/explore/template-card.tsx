import { Clock, MapPin, Download, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { TemplatePreview } from './explore-page';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: TemplatePreview;
  onClick: () => void;
  className?: string;
}

export function TemplateCard({ template, onClick, className }: TemplateCardProps) {
  // Compute rough total budget for preview
  const totalBudget = template.estimatedBudgetBreakdown
    ? Object.values(template.estimatedBudgetBreakdown).reduce((a, b) => a + Number(b), 0)
    : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-all hover:shadow-md hover:border-primary/20',
        className
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {template.coverImageUrl ? (
          <img
            src={template.coverImageUrl}
            alt={template.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <MapPin className="size-8 text-primary/20" />
          </div>
        )}
        <div className="absolute left-3 top-3 flex gap-2">
          {template.categories.slice(0, 2).map((cat) => (
            <Badge key={cat} variant="secondary" className="bg-background/80 backdrop-blur-md">
              {cat}
            </Badge>
          ))}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-medium backdrop-blur-md">
          <Download className="size-3" />
          {template.cloneCount}
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-4">
          <h3 className="line-clamp-2 font-semibold leading-tight tracking-tight">
            {template.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          <span className="truncate">{template.destination}</span>
        </div>

        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="size-3.5" />
            <span>{template.durationDays} days</span>
          </div>
          
          {totalBudget !== null && totalBudget > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="size-3.5" />
              <span>
                {totalBudget.toLocaleString()} {template.estimatedBudgetCurrency}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
