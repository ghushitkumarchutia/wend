import { useQuery } from '@tanstack/react-query';
import { exploreApi } from '@/lib/api-client';
import type { Template } from '@/types/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Users, Calendar, Map, Info, Copy } from 'lucide-react';

interface TemplatePreviewModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
  onCloneClick: (template: Template) => void;
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
  onCloneClick,
}: TemplatePreviewModalProps) {
  const { data: detailResponse, isLoading } = useQuery({
    queryKey: ['template-detail', template?.id],
    queryFn: () => exploreApi.getTemplate(template!.id),
    enabled: !!template?.id && isOpen,
  });

  const fullTemplate = detailResponse;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col gap-0 p-0">
        {!template ? null : (
          <>
            <div className="relative w-full h-64 bg-muted shrink-0">
              {template.coverImageUrl ? (
                <img
                  src={template.coverImageUrl}
                  alt={template.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                  <MapPin className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-background/90 to-transparent" />
              <div className="absolute bottom-4 left-6 right-6">
                <DialogTitle className="text-3xl font-bold text-foreground">
                  {template.title}
                </DialogTitle>
                <DialogDescription className="text-foreground/80 flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" />
                  {template.destination}
                </DialogDescription>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div className="flex flex-wrap gap-4 text-sm bg-muted/30 p-4 rounded-xl border">
                {(template.recommendedGroupSizeMin || template.recommendedGroupSizeMax) && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      Group: {template.recommendedGroupSizeMin || 1}
                      {template.recommendedGroupSizeMax
                        ? `-${template.recommendedGroupSizeMax}`
                        : '+'}
                    </span>
                  </div>
                )}
                {template.bestSeason && template.bestSeason.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Best in: {template.bestSeason.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <Badge variant="secondary">{template.difficultyLevel}</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" /> About this trip
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {template.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2 text-xl border-b pb-2">
                  <Map className="h-5 w-5" /> Itinerary Preview
                </h3>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : !fullTemplate?.days || fullTemplate.days.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground border border-dashed rounded-xl bg-muted/10">
                    No itinerary details available for this template.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {fullTemplate.days
                      .sort((a, b) => a.dayNumber - b.dayNumber)
                      .map((day) => (
                        <div key={day.id} className="border rounded-xl overflow-hidden">
                          <div className="bg-muted px-4 py-3 font-medium border-b flex justify-between items-center">
                            <span>Day {day.dayNumber}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              {day.events?.length || 0} events
                            </span>
                          </div>
                          <div className="p-4 space-y-4 bg-background">
                            {!day.events || day.events.length === 0 ? (
                              <p className="text-sm text-muted-foreground italic">Free day</p>
                            ) : (
                              day.events
                                .sort((a, b) => a.order - b.order)
                                .map((event) => (
                                  <div key={event.id} className="flex gap-4">
                                    <div className="text-xs font-medium text-muted-foreground w-16 pt-1 shrink-0 text-right">
                                      {event.time || '--:--'}
                                    </div>
                                    <div className="relative pl-4 border-l-2 border-primary/20 pb-2">
                                      <div className="absolute w-2.5 h-2.5 bg-primary/50 rounded-full left-[-5.5px] top-1.5 ring-4 ring-background" />
                                      <h4 className="font-medium text-sm">{event.title}</h4>
                                      {event.location && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                          <MapPin className="h-3 w-3" />
                                          {event.location}
                                        </p>
                                      )}
                                      {event.description && (
                                        <p className="text-xs text-muted-foreground mt-2 bg-muted/30 p-2 rounded-md">
                                          {event.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 border-t bg-background p-4 flex justify-between items-center z-10 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{template.cloneCount}</span>{' '}
                travelers have cloned this
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => onCloneClick(template)} className="gap-2">
                  <Copy className="h-4 w-4" />
                  Use Template
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
