import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { SettleUpModal } from './settle-up-modal';
import type { SettlementSuggestion } from '@/types/api';

interface SettlementSuggestionsProps {
  tripId: string;
  isOrganizerOrMember: boolean;
  suggestions: SettlementSuggestion[];
  suggestionsCurrency: string;
}

export function SettlementSuggestions({
  tripId,
  isOrganizerOrMember,
  suggestions,
  suggestionsCurrency: currency,
}: SettlementSuggestionsProps) {
  const [selectedSuggestion, setSelectedSuggestion] = useState<SettlementSuggestion | null>(null);

  return (
    <>
      <div className="relative w-full rounded-3xl p-1 bg-white shadow-2xs flex flex-col justify-start select-none font-manrope">
        <div
          className="w-full rounded-2xl px-5 md:px-6 pt-4 md:pt-5 pb-5 md:pb-6 flex flex-col justify-start transition-colors"
          style={{
            background: 'linear-gradient(to top, #E0E7FF 0%, #F8FAFC 100%)',
          }}
        >
          <div className="pb-4">
            <h3 className="text-lg md:text-xl font-semibold tracking-wide text-neutral-900 font-syne">
              How to Settle Up
            </h3>
            <p className="text-[11px] md:text-xs text-neutral-500 font-manrope mt-0.5">
              Suggested payments to resolve all debts
            </p>
          </div>

          {suggestions.length === 0 ? (
            <div
              className="relative w-full rounded-[13px] border border-white/90 backdrop-blur-md transition-all duration-300 overflow-hidden flex flex-col items-center justify-center p-5 shadow-xs"
              style={{
                background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, #DCFCE7 100%)`,
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
                  0 4px 12px -2px rgba(0, 0, 0, 0.08),
                  0 1px 3px 0 rgba(22, 163, 74, 0.25)
                `,
              }}
            >
              <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />
              <div
                className="relative z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center mb-2"
                style={{
                  boxShadow: `
                    0 2px 5px rgba(0, 0, 0, 0.12),
                    inset 0 -1px 2px rgba(0,0,0,0.05),
                    inset 0 1px 2px rgba(255,255,255,1)
                  `,
                }}
              >
                <Check className="w-5 h-5 stroke-[2.75] text-[#16A34A]" />
              </div>
              <p className="relative z-10 text-xs md:text-sm font-bold font-syne text-[#15803D] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                All settled up!
              </p>
              <p className="relative z-10 text-[11px] md:text-xs text-[#16A34A]/80 font-manrope mt-0.5 font-medium select-none">
                No pending debts to resolve.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((suggestion, i) => {
                const fromName =
                  suggestion.fromUser?.name || suggestion.fromUser?.email || 'Member';
                const toName = suggestion.toUser?.name || suggestion.toUser?.email || 'Member';

                return (
                  <div
                    key={i}
                    className="relative w-full rounded-[13px] border border-white/90 backdrop-blur-md transition-all duration-300 overflow-hidden flex flex-col gap-2 p-3"
                    style={{
                      background: `linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, #E0E7FF 100%)`,
                      boxShadow: `
                        inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                        inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
                        0 4px 12px -2px rgba(0, 0, 0, 0.08),
                        0 1px 3px 0 rgba(79, 70, 229, 0.25)
                      `,
                    }}
                  >
                    <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-1.5 min-w-0">
                      <span className="font-semibold text-neutral-800 font-manrope truncate text-xs md:text-sm">
                        {fromName}
                      </span>
                      <span className="text-[9.5px] font-bold font-manrope px-1.5 py-0.5 bg-[#EEF2FF] text-[#4F46E5] rounded-full border border-indigo-200/50 shrink-0 select-none shadow-xs">
                        owes
                      </span>
                      <span className="font-semibold text-neutral-800 font-manrope truncate text-xs md:text-sm">
                        {toName}
                      </span>
                    </div>
                    <div className="relative z-10 flex items-center justify-between gap-2 pt-0.5">
                      <span className="font-bold text-[#4F46E5] font-syne text-xs md:text-sm drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                        {formatCurrency(parseFloat(suggestion.amount), currency)}
                      </span>
                      {isOrganizerOrMember && (
                        <Button
                          size="sm"
                          variant="waterdrop"
                          className="h-7.5 px-3.5 text-[11px] md:text-xs font-semibold font-manrope text-white border border-white/35 rounded-full! cursor-pointer select-none shrink-0"
                          style={{
                            background: 'linear-gradient(145deg, #6366F1 0%, #4F46E5 100%)',
                            boxShadow: `
                              inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                              inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                              0 4px 12px -2px rgba(99, 102, 241, 0.4),
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
