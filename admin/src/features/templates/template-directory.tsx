import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetcher } from '@/lib/api-client';
import type { TemplateListResponse } from '@/types/api';
import type { Template } from '@/types/models';
import { TemplateTableRow } from './template-table-row';
import { TemplateFilters } from './template-filters';
import { TemplateVisibilityActions } from './template-visibility-actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';

export function TemplateDirectory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState('all');

  const [visibilityDialog, setVisibilityDialog] = useState<{
    isOpen: boolean;
    templateId: string;
    current: string;
  }>({
    isOpen: false,
    templateId: '',
    current: '',
  });

  const { data, isLoading, error } = useQuery<TemplateListResponse>({
    queryKey: ['templates'],
    queryFn: () => fetcher('/admin/templates'),
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetcher(`/admin/templates/${id}/duplicate`, {
        method: 'POST',
      });
      return res as { data?: { id: string }; error?: string };
    },
    onSuccess: (res) => {
      if (res.error) throw new Error(res.error);
      toast.success('Template duplicated');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
      if (res.data?.id) {
        navigate({ to: '/templates/$templateId/edit', params: { templateId: res.data.id } });
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to duplicate template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetcher(`/admin/templates/${id}`, {
        method: 'DELETE',
      });
      return res as { error?: string };
    },
    onSuccess: (res) => {
      if (res.error) throw new Error(res.error);
      toast.success('Template deleted');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Failed to delete template');
    },
  });

  const handleEdit = (id: string) => {
    navigate({ to: '/templates/$templateId/edit', params: { templateId: id } });
  };

  const handleDuplicate = (id: string) => {
    duplicateMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this template?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleChangeVisibility = (id: string, current: string) => {
    setVisibilityDialog({ isOpen: true, templateId: id, current });
  };

  if (error) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-8 text-center text-destructive">
        Failed to load templates. Please try again later.
      </div>
    );
  }

  const rawTemplates = (data?.data as unknown as Template[]) || [];

  const templates = rawTemplates.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesVisibility = visibilityFilter === 'all' || t.visibility === visibilityFilter;
    return matchesSearch && matchesVisibility;
  });

  return (
    <div>
      <TemplateFilters
        search={search}
        onSearchChange={setSearch}
        visibility={visibilityFilter}
        onVisibilityChange={setVisibilityFilter}
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Clones</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-[80px] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[40px]" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : templates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No templates found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              templates.map((template) => (
                <TemplateTableRow
                  key={template.id}
                  template={template}
                  onEdit={handleEdit}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                  onChangeVisibility={handleChangeVisibility}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {visibilityDialog.isOpen && (
        <TemplateVisibilityActions
          isOpen={visibilityDialog.isOpen}
          templateId={visibilityDialog.templateId}
          currentVisibility={visibilityDialog.current}
          onClose={() => setVisibilityDialog((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
}
