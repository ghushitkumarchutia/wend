import { useQuery } from '@tanstack/react-query';
import { tripApi, ledgerApi } from '@/lib/api-client';
import { BudgetOverview } from './budget-overview';
import { ExpenseList } from './expense-list';
import { BalancesSidebar } from './balances-sidebar';
import { useState, useEffect } from 'react';
import { DotLottiePlayer } from '@dotlottie/react-player';
import loaderUrl from '@/assets/lottie/loader.lottie?url';

interface LedgerPageProps {
  tripId: string;
}

export function LedgerPage({ tripId }: LedgerPageProps) {
  const { data: tripData, isLoading: isTripLoading } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  const { data: budgetData, isLoading: isBudgetLoading } = useQuery({
    queryKey: ['budget', tripId],
    queryFn: () => ledgerApi.getBudgetOverview(tripId),
  });

  const { data: expensesData, isLoading: isExpensesLoading } = useQuery({
    queryKey: ['expenses', tripId],
    queryFn: () => ledgerApi.getExpenses(tripId),
  });

  const { data: balancesData, isLoading: isBalancesLoading } = useQuery({
    queryKey: ['balances', tripId],
    queryFn: () => ledgerApi.getBalances(tripId),
  });

  const { data: suggestionsDataRaw, isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ['settlements', 'suggestions', tripId],
    queryFn: () => ledgerApi.getSettlementSuggestions(tripId),
  });

  const [showMinLoader, setShowMinLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMinLoader(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const isLoading =
    isTripLoading ||
    isBudgetLoading ||
    isExpensesLoading ||
    isBalancesLoading ||
    isSuggestionsLoading ||
    showMinLoader;

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

  if (!tripData) return null;

  const trip = tripData.data.trip;
  const isOrganizerOrMember = trip.role === 'organizer' || trip.role === 'member';
  const currency = trip.baseCurrency || 'USD';

  const budgetDataRaw = budgetData?.data;
  const estimatedBudget = budgetDataRaw?.estimatedBudget ?? null;
  const totalSpent = budgetDataRaw?.totalSpent ?? '0';
  const byCategory = budgetDataRaw?.byCategory ?? {};

  const expenses = expensesData?.data?.expenses ?? [];

  const rawBalances = balancesData?.data;
  const balances = Array.isArray(rawBalances)
    ? rawBalances
    : Array.isArray(rawBalances?.balances)
      ? rawBalances.balances
      : [];

  const rawSuggestions = suggestionsDataRaw?.data;
  const suggestions = Array.isArray(rawSuggestions)
    ? rawSuggestions
    : Array.isArray(rawSuggestions?.suggestions)
      ? rawSuggestions.suggestions
      : [];
  const suggestionsCurrency =
    (!Array.isArray(rawSuggestions) && rawSuggestions?.currency) || currency;

  return (
    <div className="flex flex-col lg:flex-row gap-5 md:gap-6 w-full font-manrope">
      <div className="flex-1 min-w-0 space-y-5 md:space-y-6">
        <BudgetOverview
          currency={currency}
          estimatedBudget={estimatedBudget}
          totalSpent={totalSpent}
          byCategory={byCategory}
        />
        <ExpenseList
          tripId={tripId}
          isOrganizerOrMember={isOrganizerOrMember}
          currency={currency}
          expenses={expenses}
        />
      </div>

      <div className="w-full lg:w-84 shrink-0 space-y-5">
        <BalancesSidebar
          tripId={tripId}
          isOrganizerOrMember={isOrganizerOrMember}
          currency={currency}
          balances={balances}
          suggestions={suggestions}
          suggestionsCurrency={suggestionsCurrency}
        />
      </div>
    </div>
  );
}
