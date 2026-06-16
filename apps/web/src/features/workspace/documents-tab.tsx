import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/shared/error-state';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { UploadArea } from '@/features/workspace/upload-area';
import { DocumentRow } from '@/features/workspace/document-row';
import { ImageLightbox } from '@/features/workspace/image-lightbox';
import type { TripWithRole, MemberWithUser, DocumentWithMeta } from '@wend/shared';

interface DocumentsTabProps {
  trip: TripWithRole;
  members: MemberWithUser[];
  currentUserId: string;
}

export function DocumentsTab({ trip, members, currentUserId }: DocumentsTabProps) {
  const queryClient = useQueryClient();
  const isViewer = trip.role === 'viewer';
  const [deleteTarget, setDeleteTarget] = useState<DocumentWithMeta | null>(null);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  const docsQuery = useQuery({
    queryKey: ['trips', trip.id, 'documents'],
    queryFn: () => api.get<{ data: DocumentWithMeta[] }>(`/api/v1/trips/${trip.id}/documents`),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: string) =>
      api.delete(`/api/v1/trips/${trip.id}/documents/${docId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'documents'] });
      setDeleteTarget(null);
      toast.success('Document deleted');
    },
    onError: () => toast.error('Failed to delete document'),
  });

  async function handleDownload(doc: DocumentWithMeta) {
    try {
      const res = await api.get<{ data: { url: string; fileName: string } }>(
        `/api/v1/trips/${trip.id}/documents/${doc.id}/download-url`,
      );
      const link = document.createElement('a');
      link.href = res.data.url;
      link.download = res.data.fileName;
      link.target = '_blank';
      link.click();
    } catch {
      toast.error('Failed to get download link');
    }
  }

  async function handlePreview(doc: DocumentWithMeta) {
    try {
      const res = await api.get<{ data: { url: string } }>(
        `/api/v1/trips/${trip.id}/documents/${doc.id}/download-url`,
      );
      window.open(res.data.url, '_blank');
    } catch {
      toast.error('Preview unavailable. Try downloading instead.');
    }
  }

  async function handleImageClick(doc: DocumentWithMeta) {
    try {
      const res = await api.get<{ data: { url: string } }>(
        `/api/v1/trips/${trip.id}/documents/${doc.id}/download-url`,
      );
      setLightbox({ src: res.data.url, alt: doc.fileName });
    } catch {
      toast.error('Could not load image preview');
    }
  }

  const documents = docsQuery.data?.data ?? [];

  if (docsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (docsQuery.isError) {
    return <ErrorState message="Couldn't load documents." onRetry={() => docsQuery.refetch()} />;
  }

  return (
    <>
      <div className="space-y-6">
        <UploadArea tripId={trip.id} disabled={isViewer} />

        {documents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No documents yet. Upload your first file.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                document={doc}
                members={members}
                currentUserId={currentUserId}
                userRole={trip.role}
                onDownload={handleDownload}
                onPreview={handlePreview}
                onDelete={setDeleteTarget}
                onImageClick={handleImageClick}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Delete document"
        description="Delete this document? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id); }}
      />

      <ImageLightbox
        open={!!lightbox}
        onClose={() => setLightbox(null)}
        src={lightbox?.src ?? ''}
        alt={lightbox?.alt ?? ''}
      />
    </>
  );
}
