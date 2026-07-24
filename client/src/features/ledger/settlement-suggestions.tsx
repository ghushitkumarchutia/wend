import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { ledgerApi } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { SettleUpModal } from './settle-up-modal';
import type { SettlementSuggestion } from '@/types/api';

interface SettlementSuggestionsProps {
  tripId: string;
  isOrganizerOrMember: boolean;
  currency?: string;
}

export function SettlementSuggestions({
  tripId,
  isOrganizerOrMember,
  currency: propCurrency,
}: SettlementSuggestionsProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<SettlementSuggestion | null>(null);

  const {
    data: suggestionsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['settlements', 'suggestions', tripId],
    queryFn: () => ledgerApi.getSettlementSuggestions(tripId),
  });

  if (isLoading) {
    return (
      <div
        className="relative rounded-3xl overflow-hidden border border-white/25 font-manrope select-none"
        style={{
          background: 'linear-gradient(145deg, #4f46e5 0%, #3730a3 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.3),
            0 6px 16px -2px rgba(79, 70, 229, 0.4),
            0 3px 6px 0 rgba(0, 0, 0, 0.12)
          `,
        }}
      >
        <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
        <div className="pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6">
          <div className="pb-3">
            <h3 className="text-lg md:text-xl font-semibold tracking-wide text-white/90 font-syne">
              How to Settle Up
            </h3>
          </div>
          <Skeleton className="h-12 w-full bg-white/15 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !suggestionsData) {
    return (
      <div
        className="relative rounded-3xl overflow-hidden border border-white/25 font-manrope select-none"
        style={{
          background: 'linear-gradient(145deg, #4f46e5 0%, #3730a3 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.3),
            0 6px 16px -2px rgba(79, 70, 229, 0.4),
            0 3px 6px 0 rgba(0, 0, 0, 0.12)
          `,
        }}
      >
        <div className="pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6 text-sm text-red-200 font-manrope">
          Failed to load settlement suggestions.
        </div>
      </div>
    );
  }

  const rawData = suggestionsData.data;
  const suggestions: SettlementSuggestion[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.suggestions)
      ? rawData.suggestions
      : [];
  const currency = propCurrency || (!Array.isArray(rawData) && rawData?.currency) || 'USD';

  return (
    <>
      <div
        className="relative rounded-3xl overflow-hidden border border-white/25 font-manrope select-none"
        style={{
          background: 'linear-gradient(145deg, #4f46e5 0%, #3730a3 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.35),
            inset 0 -2px 4px 0 rgba(0, 0, 0, 0.3),
            0 6px 16px -2px rgba(79, 70, 229, 0.4),
            0 3px 6px 0 rgba(0, 0, 0, 0.12)
          `,
        }}
      >
        <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
        <div className="text-white pt-4 md:pt-5 pb-5 md:pb-6 px-5 md:px-6">
          <div className="pb-3">
            <h3 className="text-lg md:text-xl font-semibold tracking-wide text-white/90 font-syne">
              How to Settle Up
            </h3>
            <p className="text-[11px] md:text-xs text-white/70 font-manrope mt-0.5">
              Suggested payments to resolve all debts
            </p>
          </div>

          {suggestions.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-4 text-center flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-white/20 text-[#4ade80] flex items-center justify-center mb-2 shadow-xs">
                <Check className="w-5 h-5 stroke-[2.75]" />
              </div>
              <p className="text-xs md:text-sm font-bold font-syne text-white">All settled up!</p>
              <p className="text-[11px] md:text-xs text-white/70 font-manrope mt-0.5 select-none">
                No pending debts to resolve.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {suggestions.map((suggestion, i) => {
                const fromName = suggestion.fromUser?.name || suggestion.fromUser?.email || 'Member';
                const toName = suggestion.toUser?.name || suggestion.toUser?.email || 'Member';

                return (
                  <div
                    key={i}
                    className="flex flex-col gap-2 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-xs md:text-sm"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-white font-manrope truncate text-xs md:text-sm">
                        {fromName}
                      </span>
                      <span className="text-[9px] font-bold font-manrope px-1.5 py-0.5 bg-white/20 text-white/90 rounded-full shrink-0 select-none">
                        owes
                      </span>
                      <span className="font-semibold text-white font-manrope truncate text-xs md:text-sm">
                        {toName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-0.5">
                      <span className="font-bold text-white font-syne text-xs md:text-sm">
                        {formatCurrency(parseFloat(suggestion.amount), currency)}
                      </span>
                      {isOrganizerOrMember && (
                        <Button
                          size="sm"
                          variant="waterdrop"
                          className="h-7.5 px-3.5 text-[11px] md:text-xs font-semibold font-manrope text-white border border-white/35 rounded-full! cursor-pointer select-none"
                          style={{
                            background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                            boxShadow: `
                              inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                              inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                              0 4px 12px -2px rgba(16, 185, 129, 0.4),
                              0 1px 3px 0 rgba(0, 0, 0, 0.08)
                            `,
                          }}
                          onClick={() => setSelectedSuggestion(suggestion)}
                        >
                          Record Payment
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedSuggestion && (
        <SettleUpModal
          tripId={tripId}
          suggestion={selectedSuggestion}
          open={!!selectedSuggestion}
          onOpenChange={(open) => !open && setSelectedSuggestion(null)}
          currency={currency}
        />
      )}
    </>
  );
}
