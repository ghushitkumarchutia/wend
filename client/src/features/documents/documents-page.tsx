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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">Documents</h2>
        {isOrganizerOrMember && (
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-[#2c6e49] hover:bg-[#23583a] text-white font-medium rounded-[12px] h-8.5 px-3.5 text-xs cursor-pointer shadow-xs transition-all duration-200 border-none flex items-center justify-center"
          >
            <Plus className="mr-1 h-3.5 w-3.5 stroke-[2.5]" />
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
