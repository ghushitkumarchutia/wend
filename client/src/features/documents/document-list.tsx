import { useQuery } from '@tanstack/react-query';
import { documentsApi, tripApi } from '@/lib/api-client';
import { DocumentCard } from './document-card';
import { useAuth } from '@/hooks/use-auth';
import { HugeiconsIcon } from '@hugeicons/react';
import { File02Icon } from '@hugeicons/core-free-icons';

interface DocumentListProps {
  tripId: string;
  isOrganizerOrMember: boolean;
}

export function DocumentList({ tripId, isOrganizerOrMember }: DocumentListProps) {
  const { user } = useAuth();

  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  const {
    data: docsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['documents', tripId],
    queryFn: () => documentsApi.getDocuments(tripId),
  });

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading documents...</div>;
  }

  if (error || !docsData || !tripData) {
    return <div className="py-8 text-center text-destructive">Failed to load documents.</div>;
  }

  const documents = docsData.data.documents;
  const currentUserId = user?.id;
  const userRole = tripData.data.trip.role;

  if (documents.length === 0) {
    return (
      <div
        className="rounded-3xl border border-dashed border-neutral-200 p-8 text-center bg-white/50 backdrop-blur-xs flex flex-col items-center justify-center min-h-55"
        style={{
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.02)',
        }}
      >
        <div className="mx-auto flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-xl bg-neutral-100 mb-2">
          <HugeiconsIcon
            icon={File02Icon}
            className="h-5 w-5 md:h-5.5 md:w-5.5 text-neutral-400"
            strokeWidth={1.5}
          />
        </div>
        <h3 className="text-sm md:text-base font-semibold font-syne text-neutral-800">
          No documents yet
        </h3>
        <p className="text-xs text-neutral-500 font-manrope mt-0.5">
          Upload boarding passes, booking confirmations, and itineraries.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5 items-start">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          tripId={tripId}
          document={doc}
          isOrganizerOrMember={isOrganizerOrMember}
          currentUserId={currentUserId}
          userRole={userRole}
        />
      ))}
    </div>
  );
}
