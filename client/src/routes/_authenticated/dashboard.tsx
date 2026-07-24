import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, tripsApi } from '@/lib/api-client';
import { StatCardsRow } from '@/features/dashboard/stat-cards-row';
import { TripsSection } from '@/features/dashboard/trips-section';
import { queryClient } from '@/lib/query-client';

export const Route = createFileRoute('/_authenticated/dashboard')({
  loader: async () => {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardApi.getStats,
      }),
      queryClient.prefetchQuery({
        queryKey: ['trips'],
        queryFn: tripsApi.listTrips,
      }),
    ]);
  },
  component: DashboardRoute,
});

function DashboardRoute() {
  const { data: statsData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: tripsData } = useQuery({
    queryKey: ['trips'],
    queryFn: tripsApi.listTrips,
  });

  const defaultStats = {
    upcomingTrips: 0,
    ongoingTrips: 0,
    completedTrips: 0,
    pendingInvites: 0,
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F5F5F7] w-full">
      <div className="flex flex-col gap-6 pt-4 pb-6 px-6 lg:pt-6 lg:pb-10 lg:px-10 w-full max-w-7xl mx-auto">
        <StatCardsRow stats={statsData?.data || defaultStats} />
        {tripsData?.data && <TripsSection trips={tripsData.data} />}
      </div>
    </div>
  );
}
