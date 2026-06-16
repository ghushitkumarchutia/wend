import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ErrorState } from '@/components/shared/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import { MembersList } from './members-list';
import { InviteMembersPanel } from './invite-members-panel';
import { PendingInvitesList, type PendingInvite } from './pending-invites-list';
import { TransferOrganizerModal } from './transfer-organizer-modal';
import type { TripWithRole, MemberWithUser } from '@wend/shared';

interface TravelersTabProps {
  trip: TripWithRole;
  members: MemberWithUser[];
  currentUserId: string;
}

export function TravelersTab({ trip, members, currentUserId }: TravelersTabProps) {
  const [transferOrgOpen, setTransferOrgOpen] = useState(false);
  const isOrganizer = trip.role === 'organizer';

  const invitesQuery = useQuery({
    queryKey: ['trips', trip.id, 'invites'],
    queryFn: () => api.get<{ data: PendingInvite[] }>(`/api/v1/trips/${trip.id}/invites`),
    enabled: isOrganizer,
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <MembersList
            trip={trip}
            members={members}
            currentUserId={currentUserId}
            onTransferOrganizer={() => setTransferOrgOpen(true)}
          />
        </div>

        <div className="lg:col-span-1 space-y-8">
          {isOrganizer && (
            <>
              <InviteMembersPanel tripId={trip.id} />
              
              {invitesQuery.isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : invitesQuery.isError ? (
                <ErrorState 
                  title="Failed to load invites" 
                  message="There was an error loading the pending invitations."
                  onRetry={() => invitesQuery.refetch()}
                />
              ) : (
                <PendingInvitesList 
                  tripId={trip.id} 
                  invites={invitesQuery.data?.data ?? []} 
                />
              )}
            </>
          )}
        </div>
      </div>

      <TransferOrganizerModal
        open={transferOrgOpen}
        onOpenChange={setTransferOrgOpen}
        trip={trip}
        members={members}
        currentUserId={currentUserId}
      />
    </div>
  );
}
