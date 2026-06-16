import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { MapPin, Users, SunMedium, BarChart3, Clock, Share2, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { api } from '@/lib/api-client';
import { useAuth } from '@/hooks/use-auth';
import type { TemplateWithDays } from '@wend/shared';
import { CloneTemplateModal } from './clone-template-modal';
import type { TemplatePreview } from './explore-page';

interface TemplatePreviewModalProps {
  templateId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Passing the simplified preview object if available for immediate display before full load
  previewData?: TemplatePreview | null;
}

export function TemplatePreviewModal({
  templateId,
  open,
  onOpenChange,
  previewData,
}: TemplatePreviewModalProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cloneModalOpen, setCloneModalOpen] = useState(false);

  const {
    data: templateData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['templates', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      const res = await api.get<{ data: TemplateWithDays }>(`/api/v1/templates/${templateId}`);
      return res.data;
    },
    enabled: open && !!templateId,
  });

  const template = templateData;

  const budgetBreakdown =
    template?.estimatedBudgetBreakdown || previewData?.estimatedBudgetBreakdown;
  const totalBudget = budgetBreakdown
    ? Object.values(budgetBreakdown).reduce((a: number, b: unknown) => a + Number(b), 0)
    : null;
  const currency =
    template?.estimatedBudgetCurrency || previewData?.estimatedBudgetCurrency || 'USD';

  const handleShare = () => {
    if (!templateId) return;
    const url = `${window.location.origin}/explore/templates/${templateId}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const handleUseTemplate = () => {
    if (!user) {
      navigate({
        to: '/sign-in',
        search: { redirect: `/explore/templates/${templateId}` },
      });
      return;
    }
    setCloneModalOpen(true);
  };

  return (
    <>
      <Dialog open={open && !cloneModalOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-0 sm:rounded-xl">
          {isLoading && !previewData ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : isError ? (
            <div className="p-6 text-center">
              <h3 className="text-lg font-semibold">Failed to load template</h3>
              <p className="text-sm text-muted-foreground">
                The template might have been removed or made private.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              <div className="relative aspect-[21/9] w-full overflow-hidden bg-muted">
                {template?.coverImageUrl || previewData?.coverImageUrl ? (
                  <img
                    src={(template?.coverImageUrl || previewData?.coverImageUrl)!}
                    alt={template?.title || previewData?.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-primary/5">
                    <MapPin className="size-12 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 flex w-full flex-col gap-2 p-6 text-white">
                  <div className="flex gap-2">
                    {(template?.categories || previewData?.categories || []).map((cat) => (
                      <Badge
                        key={cat}
                        variant="secondary"
                        className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md"
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                  <h2 className="text-2xl font-bold sm:text-3xl">
                    {template?.title || previewData?.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-white/80">
                    <div className="flex items-center gap-1">
                      <MapPin className="size-4" />
                      {template?.destination || previewData?.destination}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="size-4" />
                      {template ? template.days.length : previewData?.durationDays} days
                    </div>
                  </div>
                </div>

                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-white/20 text-white hover:bg-white/40 backdrop-blur-md border-0"
                    onClick={handleShare}
                  >
                    <Share2 className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <Tabs defaultValue="overview" className="w-full">
                  <div className="flex items-center justify-between border-b pb-4">
                    <TabsList className="bg-transparent h-auto p-0 space-x-6">
                      <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
                      >
                        Overview
                      </TabsTrigger>
                      <TabsTrigger
                        value="itinerary"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
                      >
                        Itinerary
                      </TabsTrigger>
                      <TabsTrigger
                        value="budget"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-2"
                      >
                        Budget
                      </TabsTrigger>
                    </TabsList>
                    <Button onClick={handleUseTemplate} disabled={!template}>
                      Use Template
                    </Button>
                  </div>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap">
                        {template?.description || previewData?.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {template?.difficultyLevel && (
                        <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50">
                          <BarChart3 className="size-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            Difficulty
                          </span>
                          <span className="font-medium capitalize">{template.difficultyLevel}</span>
                        </div>
                      )}
                      {template?.bestSeason && template.bestSeason.length > 0 && (
                        <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50">
                          <SunMedium className="size-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            Best Season
                          </span>
                          <span className="font-medium capitalize">
                            {template.bestSeason.join(', ')}
                          </span>
                        </div>
                      )}
                      {(template?.recommendedGroupSizeMin || template?.recommendedGroupSizeMax) && (
                        <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50">
                          <Users className="size-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            Group Size
                          </span>
                          <span className="font-medium">
                            {template.recommendedGroupSizeMin || 1} -{' '}
                            {template.recommendedGroupSizeMax || 'Any'}
                          </span>
                        </div>
                      )}
                      {totalBudget !== null && (
                        <div className="flex flex-col gap-1 p-4 rounded-lg bg-muted/50">
                          <DollarSign className="size-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">
                            Est. Budget
                          </span>
                          <span className="font-medium">
                            {totalBudget.toLocaleString()} {currency}
                          </span>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="itinerary" className="mt-6">
                    {!template ? (
                      <div className="py-8 text-center text-muted-foreground">
                        Loading itinerary...
                      </div>
                    ) : template.days.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        No itinerary events defined for this template.
                      </div>
                    ) : (
                      <Accordion type="multiple" className="w-full space-y-4">
                        {template.days.map((day) => (
                          <AccordionItem
                            key={day.id}
                            value={day.id}
                            className="border rounded-lg px-4 bg-card"
                          >
                            <AccordionTrigger className="hover:no-underline py-4">
                              <div className="flex items-center gap-4 text-left">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                                  D{day.dayNumber}
                                </div>
                                <div>
                                  <div className="font-semibold">Day {day.dayNumber}</div>
                                  <div className="text-xs text-muted-foreground font-normal">
                                    {day.events.length}{' '}
                                    {day.events.length === 1 ? 'event' : 'events'}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="pl-14 space-y-6 relative before:absolute before:inset-y-0 before:left-5 before:w-px before:bg-border pt-2">
                                {day.events.map((event) => (
                                  <div key={event.id} className="relative">
                                    <div className="absolute -left-[45px] top-1 h-3 w-3 rounded-full bg-background border-2 border-primary z-10" />
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{event.title}</span>
                                        {event.time && (
                                          <Badge
                                            variant="outline"
                                            className="text-[10px] font-normal px-1.5"
                                          >
                                            {event.time}
                                          </Badge>
                                        )}
                                      </div>
                                      {event.location && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                          <MapPin className="size-3" />
                                          {event.location}
                                        </div>
                                      )}
                                      {event.description && (
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                                          {event.description}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {day.events.length === 0 && (
                                  <div className="text-sm text-muted-foreground">
                                    Free day to explore!
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </TabsContent>

                  <TabsContent value="budget" className="mt-6">
                    {budgetBreakdown && Object.keys(budgetBreakdown).length > 0 ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/10">
                          <span className="font-semibold">Estimated Total Cost</span>
                          <span className="text-xl font-bold">
                            {totalBudget?.toLocaleString()} {currency}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Breakdown
                          </h4>
                          {Object.entries(budgetBreakdown).map(([key, value]) => {
                            if (!value) return null;
                            const percentage = totalBudget
                              ? Math.round((Number(value) / Number(totalBudget)) * 100)
                              : 0;
                            return (
                              <div key={key} className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                  </span>
                                  <span className="font-medium">
                                    {Number(value).toLocaleString()} {currency}
                                  </span>
                                </div>
                                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                                  <div
                                    className="h-full bg-primary"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                          * Note: This is an estimated budget per person based on historical data.
                          Actual costs may vary.
                        </p>
                      </div>
                    ) : (
                      <div className="py-12 text-center text-muted-foreground">
                        No budget estimation available for this template.
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {template && (
        <CloneTemplateModal
          open={cloneModalOpen}
          onOpenChange={(open) => {
            setCloneModalOpen(open);
          }}
          template={{
            id: template.id,
            title: template.title,
            destination: template.destination,
            description: template.description,
            coverImageUrl: template.coverImageUrl,
            categories: template.categories,
            recommendedGroupSizeMin: template.recommendedGroupSizeMin,
            recommendedGroupSizeMax: template.recommendedGroupSizeMax,
            bestSeason: template.bestSeason,
            difficultyLevel: template.difficultyLevel,
            estimatedBudgetBreakdown: template.estimatedBudgetBreakdown,
            estimatedBudgetCurrency: template.estimatedBudgetCurrency,
            visibility: template.visibility,
            cloneCount: template.cloneCount,
            durationDays: template.days.length,
            createdAt: template.createdAt,
          }}
        />
      )}
    </>
  );
}
