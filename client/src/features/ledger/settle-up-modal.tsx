import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { ledgerApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { SettlementSuggestion } from '@/types/api';

interface SettleUpModalProps {
  tripId: string;
  suggestion: SettlementSuggestion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency: string;
}

export function SettleUpModal({ tripId, suggestion, open, onOpenChange, currency }: SettleUpModalProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountStr, setAmountStr] = useState(parseFloat(suggestion.amount).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountToSettle = parseFloat(amountStr);
    
    if (isNaN(amountToSettle) || amountToSettle <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setIsSubmitting(true);
      await ledgerApi.settleUp(tripId, {
        fromUserId: suggestion.fromUserId,
        toUserId: suggestion.toUserId,
        amount: amountToSettle,
      });

      toast.success('Payment recorded successfully');
      
      // Invalidate relevant ledger queries
      queryClient.invalidateQueries({ queryKey: ['balances', tripId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', 'suggestions', tripId] });
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      
      onOpenChange(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to record payment';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromName = suggestion.fromUser.name || suggestion.fromUser.email;
  const toName = suggestion.toUser.name || suggestion.toUser.email;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>
            Record a cash transfer or payment made outside the app to settle debts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="p-3 bg-muted/50 rounded-md text-sm mb-4 border">
            <p className="font-medium">{fromName}</p>
            <p className="text-muted-foreground text-xs my-1">is paying</p>
            <p className="font-medium">{toName}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settle-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currency === 'USD' ? '$' : currency}
              </span>
              <Input
                id="settle-amount"
                type="number"
                step="0.01"
                min="0.01"
                className="pl-9 font-semibold text-lg"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Suggested amount: {formatCurrency(parseFloat(suggestion.amount), currency)}
            </p>
          </div>

          <DialogFooter className="pt-4 border-t mt-4">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !amountStr}>
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
