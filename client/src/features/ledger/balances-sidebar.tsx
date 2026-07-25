import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import { SettlementSuggestions } from './settlement-suggestions';
import type { MemberBalance, SettlementSuggestion } from '@/types/api';

interface BalancesSidebarProps {
  tripId: string;
  isOrganizerOrMember: boolean;
  currency: string;
  balances: MemberBalance[];
  suggestions: SettlementSuggestion[];
  suggestionsCurrency: string;
}

export function BalancesSidebar({
  tripId,
  isOrganizerOrMember,
  currency,
  balances,
  suggestions,
  suggestionsCurrency,
}: BalancesSidebarProps) {
  const activeCurrency = currency || 'USD';

  return (
    <div className="space-y-5">
      <div className="relative w-full rounded-3xl p-1 bg-white shadow-2xs flex flex-col justify-start select-none font-manrope">
        <div
          className="w-full rounded-2xl px-5 md:px-6 pt-4 md:pt-5 pb-5 md:pb-6 flex flex-col justify-start transition-colors"
          style={{
            background: 'linear-gradient(to top, #E2E8F0 0%, #F8FAFC 100%)',
          }}
        >
          <div className="pb-4">
            <h3 className="text-lg md:text-xl font-semibold tracking-wide text-neutral-900 font-syne">
              Balances
            </h3>
          </div>

          {balances.length === 0 ? (
            <div className="bg-white/50 backdrop-blur-md rounded-[13px] border border-slate-200/60 p-4 text-center shadow-xs">
              <p className="text-xs text-slate-500 font-manrope font-medium">
                No balances yet. Log an expense to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {balances.map((mb: MemberBalance) => {
                const balanceVal = parseFloat(mb.balance);
                const isPositive = balanceVal > 0;
                const isNegative = balanceVal < 0;

                const name = mb.user?.name || mb.user?.email || 'User';
                const image = mb.user?.image || '';
                const fallbackChar = name.charAt(0).toUpperCase();

                const theme = isPositive
                  ? {
                      bg: '#E0F5EA',
                      border: 'rgba(21, 128, 61, 0.25)',
                      text: '#059669',
                    }
                  : isNegative
                    ? {
                        bg: '#FFEBEB',
                        border: 'rgba(220, 38, 38, 0.25)',
                        text: '#DC2626',
                      }
                    : {
                        bg: '#F1F5F9',
                        border: 'rgba(100, 116, 139, 0.25)',
                        text: '#64748B',
                      };

                return (
                  <div
                    key={mb.userId}
                    className="relative w-full rounded-[13px] border border-white/90 backdrop-blur-md transition-all duration-300 overflow-hidden flex items-center justify-between py-2.5 px-3 gap-3"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, ${theme.bg} 100%)`,
                      boxShadow: `
                        inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                        inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
                        0 4px 12px -2px rgba(0, 0, 0, 0.08),
                        0 1px 3px 0 ${theme.border}
                      `,
                    }}
                  >
                    <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-2.5 min-w-0 pr-1">
                      <Avatar className="h-8 w-8 border border-white/60 shadow-sm shrink-0">
                        <AvatarImage src={image} />
                        <AvatarFallback
                          className="font-semibold text-xs font-syne"
                          style={{ backgroundColor: theme.bg, color: theme.text }}
                        >
                          {fallbackChar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs md:text-sm font-semibold font-manrope text-neutral-800 truncate">
                        {name}
                      </span>
                    </div>

                    <div
                      className="relative z-10 text-xs md:text-sm font-bold font-syne text-right shrink-0 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]"
                      style={{ color: theme.text }}
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
        suggestions={suggestions}
        suggestionsCurrency={suggestionsCurrency}
      />
    </div>
  );
}
