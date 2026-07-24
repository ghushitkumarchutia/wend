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
      <div
        className="relative rounded-3xl overflow-hidden border border-white/20 font-manrope"
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.25),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.4),
            0 6px 16px -2px rgba(15, 23, 42, 0.4),
            0 3px 6px 0 rgba(0, 0, 0, 0.12)
          `,
        }}
      >
        <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />
        <div className="pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6">
          <div className="pb-3">
            <h3 className="text-lg md:text-xl font-semibold tracking-wide text-white/90 font-syne">
              Balances
            </h3>
          </div>
          <div className="space-y-2.5">
            <Skeleton className="h-11 w-full bg-white/15 rounded-2xl" />
            <Skeleton className="h-11 w-full bg-white/15 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !balancesData) {
    return (
      <div
        className="relative rounded-3xl overflow-hidden border border-white/20 font-manrope"
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.25),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.4),
            0 6px 16px -2px rgba(15, 23, 42, 0.4),
            0 3px 6px 0 rgba(0, 0, 0, 0.12)
          `,
        }}
      >
        <div className="pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6 text-sm text-red-300 font-manrope">
          Failed to load balances.
        </div>
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
      <div
        className="relative rounded-3xl overflow-hidden border border-white/20 font-manrope select-none"
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.25),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.4),
            0 6px 16px -2px rgba(15, 23, 42, 0.4),
            0 3px 6px 0 rgba(0, 0, 0, 0.12)
          `,
        }}
      >
        <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />
        <div className="text-white pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6">
          <div className="pb-3">
            <h3 className="text-lg md:text-xl font-semibold tracking-wide text-white/90 font-syne">
              Balances
            </h3>
          </div>

          {balances.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 text-center">
              <p className="text-xs text-white/70 font-manrope">
                No balances yet. Log an expense to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {balances.map((mb: MemberBalance) => {
                const balanceVal = parseFloat(mb.balance);
                const isPositive = balanceVal > 0;
                const isNegative = balanceVal < 0;

                const name = mb.user?.name || mb.user?.email || 'User';
                const image = mb.user?.image || '';
                const fallbackChar = name.charAt(0).toUpperCase();

                return (
                  <div
                    key={mb.userId}
                    className="flex items-center justify-between py-2 px-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-1">
                      <Avatar className="h-8 w-8 border border-white/20 shrink-0">
                        <AvatarImage src={image} />
                        <AvatarFallback className="bg-white/20 text-white font-semibold text-xs font-syne">
                          {fallbackChar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs md:text-sm font-semibold font-manrope text-white truncate">
                        {name}
                      </span>
                    </div>
                    <div
                      className={`text-xs md:text-sm font-bold font-syne text-right shrink-0 ${
                        isPositive
                          ? 'text-[#4ade80] drop-shadow-[0_0_6px_rgba(74,222,128,0.3)]'
                          : isNegative
                            ? 'text-[#f87171] drop-shadow-[0_0_6px_rgba(248,113,113,0.3)]'
                            : 'text-white/50'
                      }`}
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

      <SettlementSuggestions
        tripId={tripId}
        isOrganizerOrMember={isOrganizerOrMember}
        currency={activeCurrency}
      />
    </div>
  );
}
