import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/lib/api-client';
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
      <div
        className="relative rounded-3xl overflow-hidden border border-white/35"
        style={{
          background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
            0 6px 16px -2px rgba(16, 185, 129, 0.45),
            0 3px 6px 0 rgba(0, 0, 0, 0.12)
          `,
        }}
      >
        <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
        <div className="pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6.5">
          <div className="pb-2">
            <h3 className="text-base md:text-xl font-semibold tracking-wide text-white/90 font-syne">Budget Overview</h3>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-white/20" />
            <Skeleton className="h-2 w-full bg-white/20" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !budgetData) {
    return (
      <div
        className="relative rounded-3xl overflow-hidden border border-white/35"
        style={{
          background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
            0 6px 16px -2px rgba(16, 185, 129, 0.45),
            0 3px 6px 0 rgba(0, 0, 0, 0.12)
          `,
        }}
      >
        <div className="pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6.5 text-sm text-white/70 font-manrope">
          Failed to load budget overview.
        </div>
      </div>
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
    <div
      className="relative rounded-3xl overflow-hidden border border-white/35 font-manrope"
      style={{
        background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
        boxShadow: `
          inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
          inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
          0 6px 16px -2px rgba(16, 185, 129, 0.45),
          0 3px 6px 0 rgba(0, 0, 0, 0.12)
        `,
      }}
    >
      <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
      <div className="text-white pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6.5">
        <div className="pb-3">
          <h3 className="text-lg md:text-xl font-semibold tracking-wide text-white/90 font-syne">
            Budget Overview
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-white/70 font-medium font-manrope">Total Spent</p>
              <p className="text-xl md:text-2xl font-bold tracking-normal text-white mt-1 font-syne">
                {formatCurrency(spent, currency)}
              </p>
            </div>
            {budget > 0 && (
              <div className="text-right">
                <p className="text-xs text-white/70 font-medium font-manrope">Budget</p>
                <p className="text-lg md:text-xl font-bold tracking-normal text-white mt-1 font-syne">
                  {formatCurrency(budget, currency)}
                </p>
              </div>
            )}
          </div>

          {budget > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-medium font-manrope text-white/80">
                <span>Budget Progress</span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded-md text-[10px] font-bold font-manrope',
                    isOverBudget ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/90',
                  )}
                >
                  {displayPercentage}% used
                </span>
              </div>

              <div
                className="flex gap-0.75 w-full items-end"
                style={{
                  background: 'rgba(0,0,0,0.18)',
                  borderRadius: '10px',
                  boxShadow:
                    'inset 0 2px 5px rgba(0,0,0,0.22), inset 0 -1px 0 rgba(255,255,255,0.06)',
                  padding: '6px 7px',
                }}
              >
                {Array.from({ length: 28 }).map((_, i) => {
                  const totalActive = Math.round((barPercentage / 100) * 28);
                  const isActive = i < totalActive;
                  const isLeading = i === totalActive - 1;
                  const barH = Math.round(12 + 8 * Math.sin((i / 27) * Math.PI));
                  return (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 rounded-[3px] transition-all duration-300',
                        isLeading && !isOverBudget ? 'ring-1 ring-white/70' : '',
                      )}
                      style={{
                        height: `${barH}px`,
                        ...(isActive
                          ? isOverBudget
                            ? {
                                background: 'linear-gradient(to bottom, #f87171 0%, #ef4444 100%)',
                                boxShadow: '0 0 6px rgba(239,68,68,0.5)',
                              }
                            : {
                                background: isLeading
                                  ? 'linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 100%)'
                                  : 'linear-gradient(to bottom, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.62) 100%)',
                                boxShadow: isLeading
                                  ? '0 0 10px rgba(255,255,255,0.65), 0 2px 4px rgba(0,0,0,0.1)'
                                  : '0 0 5px rgba(255,255,255,0.25)',
                              }
                          : { background: 'rgba(255,255,255,0.12)' }),
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {byCategory && Object.keys(byCategory).length > 0 && (
            <div className="pt-4 border-t border-white/10 space-y-2">
              <h4 className="text-[10px] md:text-xs font-semibold font-manrope text-white/70 uppercase tracking-wider">
                By Category
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {Object.entries(byCategory).map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center py-0.5">
                    <span className="capitalize text-white/80 font-medium font-manrope">
                      {cat.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-white font-syne">
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
    </div>
  );
}
