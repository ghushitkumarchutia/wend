import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface BudgetOverviewProps {
  tripId: string;
  currency: string;
}

export function BudgetOverview({ tripId, currency }: BudgetOverviewProps) {
  const {
    data: budgetData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['budget', tripId],
    queryFn: () => ledgerApi.getBudgetOverview(tripId),
  });

  if (isLoading) {
    return (
      <Card className="border border-neutral-200/50 rounded-2xl bg-white shadow-2xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-neutral-800">Budget Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full bg-neutral-100" />
          <Skeleton className="h-2 w-full bg-neutral-100" />
        </CardContent>
      </Card>
    );
  }

  if (error || !budgetData) {
    return (
      <Card className="border border-neutral-200/50 rounded-2xl bg-white shadow-2xs">
        <CardContent className="p-6 text-sm text-destructive">
          Failed to load budget overview.
        </CardContent>
      </Card>
    );
  }

  const { estimatedBudget, totalSpent, byCategory = {} } = budgetData.data;

  const spent = typeof totalSpent === 'number' ? totalSpent : parseFloat(totalSpent || '0');
  const budget = estimatedBudget
    ? typeof estimatedBudget === 'number'
      ? estimatedBudget
      : parseFloat(estimatedBudget)
    : 0;

  const displayPercentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const barPercentage = Math.min(100, displayPercentage);
  const isOverBudget = budget > 0 && spent > budget;

  return (
    <div className="bg-[#2c6e49] text-white rounded-2xl pt-5 pb-6 px-[26px]">
      <div className="pb-2">
        <h3 className="text-xl font-medium tracking-wide text-white/90">Budget Overview</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-white/70 font-medium">Total Spent</p>
            <p className="text-2xl font-bold tracking-tight text-white mt-1">
              {formatCurrency(spent, currency)}
            </p>
          </div>
          {budget > 0 && (
            <div className="text-right">
              <p className="text-xs text-white/70 font-medium">Budget</p>
              <p className="text-xl font-bold tracking-tight text-white mt-1">
                {formatCurrency(budget, currency)}
              </p>
            </div>
          )}
        </div>

        {budget > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-medium text-white/80">
              <span>Budget Progress</span>
              <span className={cn(
                "px-1.5 py-0.5 rounded text-[10px] font-bold",
                isOverBudget ? "bg-red-500/20 text-red-300" : "bg-white/10 text-white/90"
              )}>
                {displayPercentage}% used
              </span>
            </div>
            
            <div className="flex gap-[3px] w-full">
              {Array.from({ length: 35 }).map((_, i) => {
                const isActive = i < Math.round((barPercentage / 100) * 35);
                return (
                  <div
                    key={i}
                    className={cn(
                      "h-4.5 flex-1 rounded-[3px] transition-colors duration-300",
                      isActive
                        ? isOverBudget
                          ? "bg-red-400"
                          : "bg-[#5BE49B]"
                        : "bg-white/10"
                    )}
                  />
                );
              })}
            </div>
          </div>
        )}

        {byCategory && Object.keys(byCategory).length > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <h4 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
              By Category
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {Object.entries(byCategory).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between items-center py-0.5">
                  <span className="capitalize text-white/80 font-medium">
                    {cat.replace(/_/g, ' ')}
                  </span>
                  <span className="font-semibold text-white">
                    {formatCurrency(
                      typeof amount === 'number'
                        ? amount
                        : parseFloat((amount as unknown as string) || '0'),
                      currency,
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
