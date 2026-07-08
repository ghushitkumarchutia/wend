import { createLazyFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { WorkspaceHeader } from '@/features/trips/workspace-header';
import { WorkspaceTabs } from '@/features/trips/workspace-tabs';
import { useSocket } from '@/components/providers/socket-provider';
import { useEffect } from 'react';
import { CommunicationPanel } from '@/features/communication/communication-panel';

export const Route = createLazyFileRoute('/_authenticated/trips/$tripId')({
  component: TripWorkspaceLayout,
});

function TripWorkspaceLayout() {
  const { tripId } = Route.useLoaderData();

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

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading workspace...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-destructive">Failed to load trip workspace.</div>;
  }

  const trip = data.data.trip;

  return (
    <>
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <WorkspaceHeader trip={trip} />
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
            <WorkspaceTabs tripId={trip.id} role={trip.role} />
            <div className="mt-6">
              <Outlet />
            </div>
          </div>
        </div>

        <div className="w-80 flex-shrink-0 border-l hidden lg:block bg-card">
          <CommunicationPanel tripId={trip.id} />
        </div>
      </div>
    </>
  );
}
