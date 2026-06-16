import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { WorkspaceHeader } from '@/features/workspace/workspace-header';
import { WorkspaceTabs } from '@/features/workspace/workspace-tabs';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import type { WorkspaceTab } from '@/features/workspace/workspace-tabs';
import type { TripWithRole, MemberWithUser } from '@wend/shared';

export const Route = createFileRoute('/_authenticated/trips/$tripId')({
  component: TripWorkspacePage,
});

function TripWorkspacePage() {
  const { tripId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('journey');
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);

  const tripQuery = useQuery({
    queryKey: ['trips', tripId],
    queryFn: () => api.get<{ data: TripWithRole }>(`/api/v1/trips/${tripId}`),
  });

  const membersQuery = useQuery({
    queryKey: ['trips', tripId, 'members'],
    queryFn: () => api.get<{ data: MemberWithUser[] }>(`/api/v1/trips/${tripId}/members`),
    enabled: !!tripQuery.data,
  });

  const archiveMutation = useMutation({
    mutationFn: () => api.post(`/api/v1/trips/${tripId}/archive`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setArchiveOpen(false);
      toast.success('Trip archived');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: () => api.post(`/api/v1/trips/${tripId}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Trip restored');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/api/v1/trips/${tripId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDeleteOpen(false);
      toast.success('Trip deleted');
      navigate({ to: '/dashboard' });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => api.post(`/api/v1/trips/${tripId}/leave`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setLeaveOpen(false);
      toast.success('You left the trip');
      navigate({ to: '/dashboard' });
    },
  });

  if (tripQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-56 w-full" />
        <div className="mx-auto max-w-7xl space-y-4 px-4 sm:px-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (tripQuery.isError || !tripQuery.data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ErrorState message="Couldn't load this trip." onRetry={() => tripQuery.refetch()} />
      </div>
    );
  }

  const trip = tripQuery.data.data;
  const members = membersQuery.data?.data ?? [];

  return (
    <div>
      <WorkspaceHeader
        trip={trip}
        members={members}
        onEdit={() => {}}
        onArchive={() => setArchiveOpen(true)}
        onRestore={() => restoreMutation.mutate()}
        onDelete={() => setDeleteOpen(true)}
        onLeave={() => setLeaveOpen(true)}
      />

      <WorkspaceTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {activeTab === 'journey' && (
          <div className="py-12 text-center text-muted-foreground">
            Journey timeline will be rendered here.
          </div>
        )}
        {activeTab === 'ledger' && (
          <div className="py-12 text-center text-muted-foreground">
            Ledger will be rendered here.
          </div>
        )}
        {activeTab === 'documents' && (
          <div className="py-12 text-center text-muted-foreground">
            Documents will be rendered here.
          </div>
        )}
        {activeTab === 'travelers' && (
          <div className="py-12 text-center text-muted-foreground">
            Travelers will be rendered here.
          </div>
        )}
      </div>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive trip"
        description="Archiving this trip will make it read-only. You can restore it later from the Archived filter."
        confirmLabel="Archive"
        isPending={archiveMutation.isPending}
        onConfirm={() => archiveMutation.mutate()}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete trip"
        description="This will permanently delete the trip and all its data — itinerary, expenses, documents, and messages. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />

      <ConfirmDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        title="Leave trip"
        description="You will lose access to this trip. You can rejoin only if you are invited again."
        confirmLabel="Leave"
        variant="destructive"
        isPending={leaveMutation.isPending}
        onConfirm={() => leaveMutation.mutate()}
      />
    </div>
  );
}
