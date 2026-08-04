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

  const days = data?.data?.days ?? [];
  const sortedDays = [...days].sort((a, b) => (a.order ?? a.dayNumber) - (b.order ?? b.dayNumber));

  const addDayMutation = useMutation({
    mutationFn: async () => {
      const nextDayNumber =
        sortedDays.length > 0 ? Math.max(...sortedDays.map((d) => d.dayNumber)) + 1 : 1;

      return fetcher(`/admin/templates/${templateId}/days`, {
        method: 'POST',
        body: JSON.stringify({ dayNumber: nextDayNumber }),
      });
    },
    onSuccess: () => {
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
        <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !data?.data) {
    return <div className="text-destructive font-manrope">Failed to load itinerary.</div>;
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold font-syne text-neutral-900">Itinerary Builder</h3>
          <p className="text-[13px] text-neutral-500 font-manrope mt-1">
            Build the day-by-day plan for this template.
          </p>
        </div>
        <Button 
          onClick={() => addDayMutation.mutate()} 
          disabled={addDayMutation.isPending}
          className="rounded-xl h-10 px-4 font-semibold shadow-sm transition-all duration-200 active:scale-95 bg-neutral-900 hover:bg-neutral-800 text-white font-manrope text-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Day
        </Button>
      </div>

      {sortedDays.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-300 p-12 flex flex-col items-center justify-center text-center bg-neutral-50/50">
          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
            <Plus className="h-5 w-5 text-neutral-400" />
          </div>
          <h4 className="text-base font-semibold font-manrope text-neutral-900 mb-1">No Days Yet</h4>
          <p className="text-sm text-neutral-500 font-manrope mb-6 max-w-sm">
            Start building this template's itinerary by adding the first day.
          </p>
          <Button
            onClick={() => addDayMutation.mutate()}
            disabled={addDayMutation.isPending}
            className="rounded-full h-10 px-6 font-semibold shadow-sm transition-all duration-200 active:scale-95 bg-white text-neutral-900 border border-neutral-200 hover:bg-neutral-50"
          >
            <Plus className="mr-1.5 h-4 w-4" />
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
