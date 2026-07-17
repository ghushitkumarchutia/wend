import { useQuery } from '@tanstack/react-query';
import { ledgerApi } from '@/lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SettlementSuggestions } from './settlement-suggestions';
import type { MemberBalance } from '@/types/api';

interface BalancesSidebarProps {
  tripId: string;
  isOrganizerOrMember: boolean;
  currency: string;
}

export function BalancesSidebar({ tripId, isOrganizerOrMember, currency }: BalancesSidebarProps) {
  const {
    data: balancesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['balances', tripId],
    queryFn: () => ledgerApi.getBalances(tripId),
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] border-[0.5px] border-neutral-200/40 p-5 shadow-2xs space-y-4">
        <div className="pb-2">
          <Skeleton className="h-6 w-24 bg-neutral-100" />
        </div>
        <Skeleton className="h-10 w-full bg-neutral-100" />
        <Skeleton className="h-10 w-full bg-neutral-100" />
      </div>
    );
  }

  if (error || !balancesData) {
    return (
      <div className="bg-white rounded-[24px] border-[0.5px] border-[#D11A2A]/20 p-5 shadow-2xs text-sm text-[#D11A2A] font-medium">
        Failed to load balances.
      </div>
    );
  }

  const rawData = balancesData.data;
  const balances: MemberBalance[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.balances)
      ? rawData.balances
      : [];
  const activeCurrency = currency || (!Array.isArray(rawData) && rawData?.currency) || 'USD';

  return (
    <div className="space-y-5">
      <div className="relative rounded-[20px] border-[0.5px] border-neutral-200/40 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] flex flex-col bg-[#1E293B] select-none">
        <div className="pt-3.5 pb-3.5 px-5 text-white rounded-t-[20px]">
          <span className="text-[13px] md:text-[14px] font-semibold tracking-wider text-white">BALANCES</span>
        </div>
        
        <div className="bg-white rounded-t-[20px] rounded-b-[19px] p-5 flex-1 flex flex-col justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.03)] border-t border-neutral-100/50">
          {balances.length === 0 ? (
            <p className="text-xs text-neutral-400 text-center py-4 font-light select-none">
              No balances yet. Log an expense to get started.
            </p>
          ) : (
            <div className="space-y-3.5">
              {balances.map((mb: MemberBalance) => {
                const balanceVal = parseFloat(mb.balance);
                const isPositive = balanceVal > 0;
                const isNegative = balanceVal < 0;

                const name = mb.user?.name || mb.user?.email || 'User';
                const image = mb.user?.image || '';
                const fallbackChar = name.charAt(0);

                return (
                  <div key={mb.userId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8.5 w-8.5 border border-neutral-100/60 shadow-3xs">
                        <AvatarImage src={image} />
                        <AvatarFallback className="bg-neutral-50 text-neutral-500 font-semibold text-xs">{fallbackChar}</AvatarFallback>
                      </Avatar>
                      <div className="text-sm font-semibold text-neutral-800">{name}</div>
                    </div>
                    <div
                      className={`text-[14px] font-bold text-right ${isPositive ? 'text-[#2c6e49]' : isNegative ? 'text-[#D11A2A]' : 'text-neutral-400'}`}
                    >
                      {isPositive ? '+' : ''}
                      {formatCurrency(balanceVal, activeCurrency)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SettlementSuggestions tripId={tripId} isOrganizerOrMember={isOrganizerOrMember} currency={activeCurrency} />
    </div>
  );
}
