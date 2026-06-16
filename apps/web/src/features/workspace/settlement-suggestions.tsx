import { PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SettlementSuggestion } from '@wend/shared';

interface SettlementSuggestionsProps {
  suggestions: SettlementSuggestion[];
  currency: string;
  onSettle: (suggestion: SettlementSuggestion) => void;
}

export function SettlementSuggestions({ suggestions, currency, onSettle }: SettlementSuggestionsProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Suggested Settlements</h4>
      {suggestions.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <PartyPopper className="size-4" />
          <span>All settled up!</span>
        </div>
      ) : (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-2 rounded-md border p-2 text-sm">
              <span className="min-w-0 truncate">
                {s.fromUserName} owes {s.toUserName}{' '}
                <span className="font-medium">{currency} {parseFloat(s.amount).toFixed(2)}</span>
              </span>
              <Button size="xs" variant="outline" onClick={() => onSettle(s)}>
                Settle
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
