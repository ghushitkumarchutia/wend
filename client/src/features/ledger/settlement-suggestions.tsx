import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check } from 'lucide-react';
import { ledgerApi } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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

export function SettlementSuggestions({ tripId, isOrganizerOrMember, currency: propCurrency }: SettlementSuggestionsProps) {
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
      <Card>
        <CardHeader>
          <CardTitle>How to Settle Up</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full bg-neutral-100" />
        </CardContent>
      </Card>
    );
  }

  if (error || !suggestionsData) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Failed to load settlement suggestions.
        </CardContent>
      </Card>
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
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>How to settle up</CardTitle>
          <CardDescription>Suggested payments to resolve all debts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center text-center py-6 px-4 bg-white border border-dashed border-neutral-200/80 rounded-xl">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 mb-2">
              <Check className="w-5 h-5 stroke-[2.5]" />
            </div>
            <p className="text-sm font-semibold text-neutral-800">All settled up!</p>
            <p className="text-xs text-neutral-400 font-light mt-0.5">No pending debts to resolve.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>How to Settle Up</CardTitle>
          <CardDescription>Suggested payments to resolve all debts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map((suggestion, i) => {
            const fromName = suggestion.fromUser?.name || suggestion.fromUser?.email || 'Member';
            const toName = suggestion.toUser?.name || suggestion.toUser?.email || 'Member';

            return (
              <div
                key={i}
                className="flex flex-col space-y-2 p-3 bg-muted/30 rounded-md border text-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{fromName}</span>
                  <span className="text-muted-foreground mx-2 text-xs">owes</span>
                  <span className="font-medium">{toName}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="font-bold">
                    {formatCurrency(parseFloat(suggestion.amount), currency)}
                  </span>
                  {isOrganizerOrMember && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => setSelectedSuggestion(suggestion)}
                    >
                      Record Payment
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

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
