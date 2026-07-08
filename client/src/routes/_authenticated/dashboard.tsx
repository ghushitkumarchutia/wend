import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, tripsApi } from '@/lib/api-client';
import { StatCardsRow } from '@/features/dashboard/stat-cards-row';
import { TripsSection } from '@/features/dashboard/trips-section';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  const { data: statsData, isLoading: isLoadingStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: tripsData, isLoading: isLoadingTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: tripsApi.listTrips,
  });

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 w-full max-w-7xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here is an overview of your trips and pending invites.
        </p>
      </div>

      {!isLoadingStats && statsData?.data && <StatCardsRow stats={statsData.data} />}

      {!isLoadingTrips && tripsData?.data && <TripsSection trips={tripsData.data} />}
    </div>
  );
}
