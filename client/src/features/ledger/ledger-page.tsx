import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { BudgetOverview } from './budget-overview';
import { ExpenseList } from './expense-list';
import { BalancesSidebar } from './balances-sidebar';

interface LedgerPageProps {
  tripId: string;
}

export function LedgerPage({ tripId }: LedgerPageProps) {
  const { data: tripData } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  if (!tripData) return null;

  const trip = tripData.data.trip;
  const isOrganizerOrMember = trip.role === 'organizer' || trip.role === 'member';
  const currency = trip.baseCurrency || 'USD';

  return (
    <div className="flex flex-col lg:flex-row gap-5">
      <div className="flex-1 space-y-4.5">
        <BudgetOverview tripId={tripId} currency={currency} />
        <ExpenseList
          tripId={tripId}
          isOrganizerOrMember={isOrganizerOrMember}
          currency={currency}
        />
      </div>

      <div className="w-full lg:w-80 shrink-0 space-y-3">
        <BalancesSidebar
          tripId={tripId}
          isOrganizerOrMember={isOrganizerOrMember}
          currency={currency}
        />
      </div>
    </div>
  );
}
