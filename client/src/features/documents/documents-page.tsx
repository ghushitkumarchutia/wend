import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentList } from './document-list';
import { UploadDocumentModal } from './upload-document-modal';

interface DocumentsPageProps {
  tripId: string;
}

export function DocumentsPage({ tripId }: DocumentsPageProps) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  if (!tripData) return null;

  const trip = tripData.data.trip;
  const isOrganizerOrMember = trip.role === 'organizer' || trip.role === 'member';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Documents</h2>
        {isOrganizerOrMember && (
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        )}
      </div>

      <DocumentList tripId={tripId} isOrganizerOrMember={isOrganizerOrMember} />

      {isUploadModalOpen && (
        <UploadDocumentModal
          tripId={tripId}
          open={isUploadModalOpen}
          onOpenChange={setIsUploadModalOpen}
        />
      )}
    </div>
  );
}
