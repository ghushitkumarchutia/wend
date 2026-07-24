import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency, getCurrencySymbol } from '@/lib/utils';
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

export function SettleUpModal({
  tripId,
  suggestion,
  open,
  onOpenChange,
  currency,
}: SettleUpModalProps) {
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

  const currencySymbol = getCurrencySymbol(currency || 'USD');
  const paddingLeftPx = Math.max(36, 14 + currencySymbol.length * 9.5 + 4);

  const inputCls =
    'bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5 md:h-11 px-4 text-xs md:text-sm font-manrope text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';
  const labelCls =
    'text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[92vw] md:max-w-110 rounded-3xl md:rounded-[32px] bg-white pt-5 pb-6 px-6 md:pt-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 max-h-[90vh] overflow-y-auto font-manrope"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
          <DialogTitle className="text-xl md:text-2xl font-bold text-[#10b981] font-syne text-center tracking-tight">
            Record Payment
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed">
            Record a cash transfer or payment made outside the app to settle debts.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-3.5 py-0 mt-4">
          <div className="p-3.5 md:p-4 bg-[#F5F5F7] border border-neutral-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs md:text-sm font-manrope select-none">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] md:text-xs text-neutral-400 font-medium font-manrope">
                Payer
              </span>
              <span className="font-semibold text-neutral-900 text-xs md:text-sm truncate">
                {fromName}
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200/60 rounded-full shadow-2xs text-[11px] font-semibold text-[#10b981] shrink-0">
              <span>is paying</span>
              <span className="text-xs">→</span>
            </div>
            <div className="flex flex-col text-right min-w-0">
              <span className="text-[10px] md:text-xs text-neutral-400 font-medium font-manrope">
                Recipient
              </span>
              <span className="font-semibold text-neutral-900 text-xs md:text-sm truncate">
                {toName}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settle-amount" className={labelCls}>
              Amount *
            </Label>
            <div className="relative w-full">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold select-none font-manrope">
                {currencySymbol}
              </span>
              <Input
                id="settle-amount"
                type="number"
                step="0.01"
                min="0.01"
                className={inputCls}
                style={{ paddingLeft: `${paddingLeftPx}px` }}
                placeholder="0.00"
                value={amountStr}
                onChange={(e) => setAmountStr(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <p className="text-xs text-neutral-400 font-manrope mt-0.5">
              Suggested amount:{' '}
              <strong className="font-semibold text-neutral-700 font-syne">
                {formatCurrency(parseFloat(suggestion.amount), currency)}
              </strong>
            </p>
          </div>

          <div className="flex gap-2.5 md:gap-3 mt-4">
            <Button
              type="button"
              variant="waterdrop"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #F85252 0%, #E63946 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 14px -2px rgba(230, 57, 70, 0.4),
                  0 1px 3px 0 rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="waterdrop"
              disabled={isSubmitting || !amountStr || parseFloat(amountStr) <= 0}
              className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 14px -2px rgba(16, 185, 129, 0.4),
                  0 1px 3px 0 rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
