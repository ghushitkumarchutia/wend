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
      <div className="bg-white rounded-[24px] border-[0.5px] border-neutral-200/40 p-5 shadow-2xs space-y-4">
        <div className="pb-2">
          <Skeleton className="h-6 w-28 bg-neutral-100" />
        </div>
        <Skeleton className="h-12 w-full bg-neutral-100" />
      </div>
    );
  }

  if (error || !suggestionsData) {
    return (
      <div className="bg-white rounded-[24px] border-[0.5px] border-[#D11A2A]/20 p-5 shadow-2xs text-sm text-[#D11A2A] font-medium">
        Failed to load settlement suggestions.
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

  if (suggestions.length === 0) {
    return (
      <div className="relative rounded-[20px] border-[0.5px] border-neutral-200/40 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] flex flex-col bg-[#334155]">
        <div className="pt-3.5 pb-3.5 px-5 text-neutral-900 flex flex-col justify-center rounded-t-[20px]">
          <span className="text-[13px] md:text-[14px] font-semibold tracking-wider text-white">
            HOW TO SETTLE UP
          </span>
          <span className="text-[10px] text-neutral-200 font-light tracking-wide mt-0.5">
            Suggested payments to resolve all debts
          </span>
        </div>
        <div className="bg-white rounded-t-[20px] rounded-b-[19px] p-5 flex-1 flex flex-col justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.03)] border-t border-neutral-100/50">
          <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-white border border-dashed border-neutral-300 rounded-2xl">
            <div className="w-10 h-10 bg-[#D1FAE5]/60 rounded-xl flex items-center justify-center text-[#047857] mb-2.5 shadow-3xs">
              <Check className="w-5 h-5 stroke-[2.8]" />
            </div>
            <p className="text-sm font-bold text-neutral-800">All settled up!</p>
            <p className="text-xs text-neutral-400 font-light mt-0.5 select-none">
              No pending debts to resolve.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative rounded-[20px] border-[0.5px] border-neutral-200/40 shadow-[0_10px_30px_rgba(0,0,0,0.04),0_2px_8px_rgba(0,0,0,0.02)] flex flex-col bg-[#B0E454] select-none">
        <div className="pt-3.5 pb-3.5 px-5 text-neutral-900 flex flex-col justify-center rounded-t-[20px]">
          <span className="text-[13px] md:text-[14px] font-bold tracking-wider text-neutral-900">
            HOW TO SETTLE UP
          </span>
          <span className="text-[10px] text-neutral-700 font-medium mt-0.5">
            Suggested payments to resolve all debts
          </span>
        </div>

        <div className="bg-white rounded-t-[20px] rounded-b-[19px] p-5 flex-1 flex flex-col justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.03)] border-t border-neutral-100/50">
          <div className="space-y-2.5">
            {suggestions.map((suggestion, i) => {
              const fromName = suggestion.fromUser?.name || suggestion.fromUser?.email || 'Member';
              const toName = suggestion.toUser?.name || suggestion.toUser?.email || 'Member';

              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-neutral-50/50 rounded-2xl border border-neutral-100/80 text-sm"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-neutral-800 truncate text-[13px]">
                      {fromName}
                    </span>
                    <span className="text-[9px] text-neutral-400 font-semibold px-1.5 py-0.5 bg-neutral-100 rounded-full shrink-0 select-none">
                      owes
                    </span>
                    <span className="font-semibold text-neutral-800 truncate text-[13px]">
                      {toName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0 ml-2">
                    <span className="font-bold text-neutral-900 text-xs">
                      {formatCurrency(parseFloat(suggestion.amount), currency)}
                    </span>
                    {isOrganizerOrMember && (
                      <Button
                        size="sm"
                        className="bg-[#2c6e49] hover:bg-[#23583a] text-white text-[10.5px] font-semibold px-2.5 py-1 h-7.5 rounded-[10px] border-none cursor-pointer shadow-3xs transition-colors focus-visible:ring-0!"
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
