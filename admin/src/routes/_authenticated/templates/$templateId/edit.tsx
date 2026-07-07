/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import { TemplateForm } from '@/features/templates/template-form';
import { useTemplateFormStore } from '@/stores/template-form-store';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { TemplateDetailResponse, ApiResponse } from '@/types/api';
import type { Template } from '@/types/models';

export const Route = createFileRoute('/_authenticated/templates/$templateId/edit')({
  component: EditTemplatePage,
});

function EditTemplatePage() {
  const { templateId } = Route.useParams();
  const queryClient = useQueryClient();
  const { hydrate, isDirty } = useTemplateFormStore();

  const { data, isLoading, error } = useQuery<ApiResponse<TemplateDetailResponse>>({
    queryKey: ['template', templateId],
    queryFn: () => fetcher(`/admin/templates/${templateId}`),
  });

  useEffect(() => {
    if (data?.data && !isDirty) {
      hydrate(data.data);
    }
  }, [data, hydrate, isDirty]);

  const mutation = useMutation({
    mutationFn: async (updateData: Partial<Template>) => {
      return fetcher<ApiResponse<TemplateDetailResponse>>(
        `/admin/templates/${templateId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updateData),
        },
      );
    },
    onSuccess: (res) => {
      toast.success('Template saved successfully');
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      queryClient.invalidateQueries({ queryKey: ['template-stats'] });
      if (res.data) hydrate(res.data);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to save template');
    },
  });

  const handleSave = (updateData: Partial<Template>) => {
    mutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-8 text-center text-destructive">
        Failed to load template details.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <TemplateForm onSave={handleSave} isSaving={mutation.isPending} />
    </div>
  );
}
