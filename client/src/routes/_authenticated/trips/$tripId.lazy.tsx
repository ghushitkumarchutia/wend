import { createLazyFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { WorkspaceHeader } from '@/features/trips/workspace-header';
import { WorkspaceTabs } from '@/features/trips/workspace-tabs';
import { useSocket } from '@/components/providers/socket-provider';
import { useEffect, useState } from 'react';
import { CommunicationPanel } from '@/features/communication/communication-panel';
import { DotLottiePlayer } from '@dotlottie/react-player';
import loaderUrl from '@/assets/lottie/loader.lottie?url';

export const Route = createLazyFileRoute('/_authenticated/trips/$tripId')({
  component: TripWorkspaceLayout,
});

function TripWorkspaceLayout() {
  const { tripId } = Route.useLoaderData();
  const [showMinLoader, setShowMinLoader] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  const { socket } = useSocket();

  useEffect(() => {
    if (socket && tripId) {
      socket.emit('trip:join', tripId);

      return () => {
        // Optional: emit trip:leave if backend requires it, but joining a new trip is fine
      };
    }
  }, [socket, tripId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMinLoader(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showMinLoader) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center bg-white">
        <div className="w-48 h-48 flex items-center justify-center">
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

  if (error || !data) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] p-8 items-center justify-center text-center text-destructive bg-white">
        Failed to load trip workspace.
      </div>
    );
  }

  const trip = data.data.trip;

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-white">
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#F5F5F7]">
          <WorkspaceHeader trip={trip} />
          <WorkspaceTabs tripId={trip.id} role={trip.role} />
          <div className="w-full px-4 sm:px-6 md:px-8 pt-1.5 sm:pt-2.5 pb-6 flex-1 space-y-6 bg-[#F5F5F7]">
            <div>
              <Outlet />
            </div>
          </div>
        </div>

        <div className="w-96 shrink-0 border-l hidden lg:block bg-card">
          <CommunicationPanel tripId={trip.id} />
        </div>
      </div>
    </>
  );
}
