import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';
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
    <div className="space-y-2.5 md:space-y-3">
      <div className="flex items-center justify-between mt-1 md:-mt-3">
        <h2 className="text-[18px] md:text-2xl font-semibold tracking-wide text-neutral-900 font-syne">
          Documents
        </h2>
        {isOrganizerOrMember && (
          <Button
            variant="waterdrop"
            onClick={() => setIsUploadModalOpen(true)}
            className="pl-2 md:pl-2.5 pr-2.5 md:pr-3.5 py-1.5 md:py-1.75 h-auto inline-flex items-center"
          >
            <div
              className="size-3.5 md:size-5.5 rounded-full bg-white flex items-center justify-center shrink-0 relative z-10 group-hover:scale-105 transition-transform translate-y-[-0.4px]"
              style={{
                boxShadow: `
                  inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                  inset 0 1px 2px rgba(255, 255, 255, 1),
                  0 2px 4px rgba(0, 0, 0, 0.15)
                `,
              }}
            >
              <HugeiconsIcon
                icon={Add01Icon}
                className="size-2.5 md:size-3.5 block"
                color="#10b981"
                strokeWidth={2.5}
              />
            </div>

            <span className="text-[10px] md:text-sm font-semibold tracking-wide text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] leading-none relative top-[-0.7px] md:top-[-1.5px]">
              Upload Document
            </span>
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
