import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { BudgetOverview } from './budget-overview';
import { ExpenseList } from './expense-list';
import { BalancesSidebar } from './balances-sidebar';
import { Skeleton } from '@/components/ui/skeleton';

interface LedgerPageProps {
  tripId: string;
}

export function LedgerPage({ tripId }: LedgerPageProps) {
  const { data: tripData, isLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-5 md:gap-6 w-full font-manrope">
        <div className="flex-1 min-w-0 space-y-5 md:space-y-6">
          <Skeleton className="h-64 w-full rounded-3xl bg-neutral-200/50" />
          <Skeleton className="h-96 w-full rounded-3xl bg-neutral-200/50" />
        </div>
        <div className="w-full lg:w-84 shrink-0 space-y-5">
          <Skeleton className="h-48 w-full rounded-3xl bg-neutral-200/50" />
          <Skeleton className="h-48 w-full rounded-3xl bg-neutral-200/50" />
        </div>
      </div>
    );
  }

  if (!tripData) return null;

  const trip = tripData.data.trip;
  const isOrganizerOrMember = trip.role === 'organizer' || trip.role === 'member';
  const currency = trip.baseCurrency || 'USD';

  return (
    <div className="flex flex-col lg:flex-row gap-5 md:gap-6 w-full font-manrope">
      <div className="flex-1 min-w-0 space-y-5 md:space-y-6">
        <BudgetOverview tripId={tripId} currency={currency} />
        <ExpenseList
          tripId={tripId}
          isOrganizerOrMember={isOrganizerOrMember}
          currency={currency}
        />
      </div>

      <div className="w-full lg:w-84 shrink-0 space-y-5">
        <BalancesSidebar
          tripId={tripId}
          isOrganizerOrMember={isOrganizerOrMember}
          currency={currency}
        />
      </div>
    </div>
  );
}
