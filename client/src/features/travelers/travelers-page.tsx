import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { MembersList } from './members-list';
import { PendingInvitesList } from './pending-invites-list';
import { InviteMembersPanel } from './invite-members-panel';
import { Separator } from '@/components/ui/separator';

interface TravelersPageProps {
  tripId: string;
}

export function TravelersPage({ tripId }: TravelersPageProps) {
  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  const role = tripData?.data.trip.role;
  const isOrganizer = role === 'organizer';

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <MembersList tripId={tripId} isOrganizer={isOrganizer} />
        <Separator />
        <PendingInvitesList tripId={tripId} isOrganizer={isOrganizer} />
      </div>
      <div className="lg:col-span-1">{isOrganizer && <InviteMembersPanel tripId={tripId} />}</div>
    </div>
  );
}
