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
    <div className="flex flex-col gap-6 pt-4 pb-6 px-6 lg:pt-6 lg:pb-10 lg:px-10 w-full max-w-7xl mx-auto">
      {!isLoadingStats && statsData?.data && <StatCardsRow stats={statsData.data} />}

      {!isLoadingTrips && tripsData?.data && <TripsSection trips={tripsData.data} />}
    </div>
  );
}
