import { createLazyFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { WorkspaceHeader } from '@/features/trips/workspace-header';
import { WorkspaceTabs } from '@/features/trips/workspace-tabs';

export const Route = createLazyFileRoute('/_authenticated/trips/$tripId')({
  component: TripWorkspaceLayout,
});

function TripWorkspaceLayout() {
  const { tripId } = Route.useLoaderData();

  const { data, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading workspace...</div>;
  }

  if (error || !data) {
    return <div className="p-8 text-center text-destructive">Failed to load trip workspace.</div>;
  }

  const trip = data.data.trip;

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <WorkspaceHeader trip={trip} />
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <WorkspaceTabs tripId={trip.id} role={trip.role} />
        <div className="mt-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
