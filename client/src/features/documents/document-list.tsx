import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api-client';
import { DocumentCard } from './document-card';
import { useAuth } from '@/hooks/use-auth';
import { tripApi } from '@/lib/api-client';
import { File } from 'lucide-react';

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
      <div className="w-full py-12 text-center bg-white border border-dashed border-neutral-300 rounded-xl text-neutral-400 font-light text-sm sm:text-base tracking-normal flex flex-col items-center justify-center gap-2">
        <div className="p-3 bg-neutral-50 rounded-full border border-neutral-200">
          <File className="h-6 w-6 text-neutral-400 stroke-1" />
        </div>
        <h3 className="text-base font-semibold text-neutral-800 tracking-tight mt-1">
          No documents yet
        </h3>
        <p className="text-xs text-neutral-400 font-light max-w-xs px-4">
          Upload boarding passes, booking confirmations, and itineraries.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
