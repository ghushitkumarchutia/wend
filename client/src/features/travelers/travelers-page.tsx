import { useQuery } from '@tanstack/react-query';
import { tripApi, travelersApi } from '@/lib/api-client';
import { MembersList } from './members-list';
import { PendingInvitesList } from './pending-invites-list';
import { InviteMembersPanel } from './invite-members-panel';
import { useState, useEffect } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import loaderUrl from '@/assets/lottie/loader.lottie?url';

interface TravelersPageProps {
  tripId: string;
}

export function TravelersPage({ tripId }: TravelersPageProps) {
  const { data: tripData, isLoading: isTripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  const { data: membersData, isLoading: isMembersLoading } = useQuery({
    queryKey: ['trip-members', tripId],
    queryFn: () => travelersApi.getMembers(tripId),
  });

  const { data: invitesData, isLoading: isInvitesLoading } = useQuery({
    queryKey: ['trip-invites', tripId],
    queryFn: () => travelersApi.getPendingInvites(tripId),
  });

  const [showMinLoader, setShowMinLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMinLoader(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = isTripLoading || isMembersLoading || isInvitesLoading || showMinLoader;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 w-full">
        <div className="w-28 h-28 flex items-center justify-center">
          <DotLottiePlayer
            src={loaderUrl}
            autoplay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }

  const role = tripData?.data.trip.role;
  const isOrganizer = role === 'organizer';
  const members = membersData?.data.members ?? [];
  const allInvites = invitesData?.data.invites ?? [];
  const pendingInvites = allInvites.filter((inv) => inv.status === 'pending');

  return (
    <div className="grid gap-4.5 md:gap-5 lg:grid-cols-3">
      <div
        className={
          isOrganizer
            ? 'lg:col-span-2 space-y-3.5 md:space-y-4'
            : 'lg:col-span-3 space-y-3.5 md:space-y-4'
        }
      >
        <MembersList tripId={tripId} isOrganizer={isOrganizer} members={members} />
        {pendingInvites.length > 0 && (
          <PendingInvitesList
            tripId={tripId}
            isOrganizer={isOrganizer}
            pendingInvites={pendingInvites}
          />
        )}
      </div>
      {isOrganizer && (
        <div className="lg:col-span-1">
          <InviteMembersPanel tripId={tripId} />
        </div>
      )}
    </div>
  );
}
