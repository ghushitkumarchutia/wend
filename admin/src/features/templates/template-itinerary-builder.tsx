import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { DaySectionBuilder } from './day-section-builder';
import type { TemplateDetailResponse, ApiResponse } from '@/types/api';
import { toast } from 'sonner';

interface Props {
  templateId: string;
}

export function TemplateItineraryBuilder({ templateId }: Props) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<ApiResponse<TemplateDetailResponse>>({
    queryKey: ['template', templateId],
    queryFn: () => fetcher(`/admin/templates/${templateId}`),
  });

  const addDayMutation = useMutation({
    mutationFn: async () => {
      return (await fetcher(`/admin/templates/${templateId}/days`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })) as { error?: string };
    },
    onSuccess: (res) => {
      if (res.error) throw new Error(res.error);
      toast.success('New day added');
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to add day');
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data?.data) {
    return <div className="text-destructive">Failed to load itinerary.</div>;
  }

  const days = data.data.days || [];

  const sortedDays = [...days].sort((a, b) => (a.order ?? a.dayNumber) - (b.order ?? b.dayNumber));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Itinerary</h3>
          <p className="text-sm text-muted-foreground">
            Build the day-by-day plan for this template.
          </p>
        </div>
        <Button onClick={() => addDayMutation.mutate()} disabled={addDayMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" />
          Add Day
        </Button>
      </div>

      {sortedDays.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center bg-muted/20">
          <h4 className="text-sm font-medium mb-1">No Days Yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start by adding the first day to the itinerary.
          </p>
          <Button
            variant="outline"
            onClick={() => addDayMutation.mutate()}
            disabled={addDayMutation.isPending}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Day 1
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDays.map((day) => (
            <DaySectionBuilder key={day.id} templateId={templateId} day={day} />
          ))}
        </div>
      )}
    </div>
  );
}
