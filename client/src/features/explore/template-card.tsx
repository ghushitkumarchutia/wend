import type { Template } from '@/types/models';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, BarChart, Copy } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onClick: (template: Template) => void;
}

export function TemplateCard({ template, onClick }: TemplateCardProps) {
  return (
    <Card
      className="overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group flex flex-col h-full"
      onClick={() => onClick(template)}
    >
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {template.coverImageUrl ? (
          <img
            src={template.coverImageUrl}
            alt={template.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-secondary/50">
            <MapPin className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-2">
          {template.visibility === 'featured' && (
            <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">
              Featured
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex justify-between items-start gap-4">
          <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
            {template.title}
          </h3>
        </div>
        <div className="flex items-center text-sm text-muted-foreground gap-1">
          <MapPin className="h-3.5 w-3.5" />
          <span className="line-clamp-1">{template.destination}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{template.description}</p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {template.categories.slice(0, 3).map((cat: string) => (
            <Badge key={cat} variant="secondary" className="text-xs font-normal">
              {cat}
            </Badge>
          ))}
          {template.categories.length > 3 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{template.categories.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex flex-wrap gap-y-2 gap-x-4 border-t mt-auto items-center">
        {template.difficultyLevel && (
          <div className="flex items-center gap-1.5 capitalize">
            <BarChart className="h-3.5 w-3.5" />
            {template.difficultyLevel}
          </div>
        )}

        {(template.recommendedGroupSizeMin || template.recommendedGroupSizeMax) && (
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {template.recommendedGroupSizeMin || 1}
            {template.recommendedGroupSizeMax ? `-${template.recommendedGroupSizeMax}` : '+'}
          </div>
        )}

        {template.bestSeason && template.bestSeason.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {template.bestSeason.length > 1
              ? `${template.bestSeason[0]} & more`
              : template.bestSeason[0]}
          </div>
        )}

        <div className="flex items-center gap-1.5 ml-auto text-primary font-medium">
          <Copy className="h-3.5 w-3.5" />
          {template.cloneCount} {template.cloneCount === 1 ? 'clone' : 'clones'}
        </div>
      </CardFooter>
    </Card>
  );
}
