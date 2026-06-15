import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Plane, MapPin, CheckCircle2, Mail } from 'lucide-react';
import { api } from '@/lib/api-client';
import { StatCard } from '@/components/shared/stat-card';
import { StatCardSkeleton } from '@/components/shared/loading-skeleton';
import { PendingInvitesSection } from '@/features/dashboard/pending-invites-section';
import { TripsSection } from '@/features/dashboard/trips-section';
import type { DashboardStats, TripWithRole } from '@wend/shared';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => api.get<{ data: DashboardStats }>('/api/v1/dashboard/stats'),
  });

  const tripsQuery = useQuery({
    queryKey: ['trips'],
    queryFn: () => api.get<{ data: TripWithRole[] }>('/api/v1/trips'),
  });

  const stats = statsQuery.data?.data;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <PendingInvitesSection />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Upcoming Trips" value={stats?.upcomingTrips ?? 0} icon={Plane} />
            <StatCard label="Ongoing Trips" value={stats?.ongoingTrips ?? 0} icon={MapPin} />
            <StatCard
              label="Completed Trips"
              value={stats?.completedTrips ?? 0}
              icon={CheckCircle2}
            />
            <StatCard label="Pending Invites" value={stats?.pendingInvites ?? 0} icon={Mail} />
          </>
        )}
      </div>

      <TripsSection
        trips={tripsQuery.data?.data ?? []}
        isLoading={tripsQuery.isLoading}
        isError={tripsQuery.isError}
        onRetry={() => tripsQuery.refetch()}
      />
    </div>
  );
}
