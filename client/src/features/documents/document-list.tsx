import { useQuery } from '@tanstack/react-query';
import { documentsApi } from '@/lib/api-client';
import { DocumentCard } from './document-card';
import { useAuth } from '@/hooks/use-auth';
import { tripApi } from '@/lib/api-client';

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
      <div className="text-center py-16 bg-muted/20 rounded-lg border border-dashed">
        <h3 className="text-lg font-medium">No documents yet</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
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
