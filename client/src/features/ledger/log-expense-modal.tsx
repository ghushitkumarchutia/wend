import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { SplitMethodFields, type ParticipantShare } from './split-method-fields';
import { ledgerApi, travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { getCurrencySymbol } from '@/lib/utils';
import type { Expense, ExpenseCategory, SplitMethod } from '@/types/models';

interface LogExpenseModalProps {
  tripId: string;
  expense?: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: string;
}

export function LogExpenseModal({
  tripId,
  expense,
  open,
  onOpenChange,
  currency,
}: LogExpenseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[480px] rounded-2xl bg-white pt-5 md:pt-6 pb-6 px-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 animate-in fade-in-0 zoom-in-95 max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
          <DialogTitle className="text-[22px] font-semibold text-[#09a474] font-heading text-center">
            {expense ? 'Edit Expense' : 'Log Expense'}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-400 font-light text-center">
            {expense
              ? 'Update the details for this shared expense.'
              : 'Record a new shared expense for this trip.'}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ExpenseForm
            tripId={tripId}
            expense={expense}
            onClose={() => onOpenChange(false)}
            currency={currency}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ExpenseFormProps {
  tripId: string;
  expense?: Expense;
  onClose: () => void;
  currency?: string;
}

function ExpenseForm({ tripId, expense, onClose, currency }: ExpenseFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: membersData } = useQuery({
    queryKey: ['travelers', tripId],
    queryFn: () => travelersApi.getMembers(tripId),
  });
  const members = membersData?.data.members || [];

  const [description, setDescription] = useState(expense?.description || '');
  const [amountStr, setAmountStr] = useState(expense?.amount || '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'food_and_drinks');
  const [paidByUserId, setPaidByUserId] = useState(expense?.paidByUserId || '');

  const [incurredAt, setIncurredAt] = useState<Date>(() => {
    if (expense?.incurredAt) {
      return new Date(expense.incurredAt);
    }
    return new Date();
  });

  const [splitMethod, setSplitMethod] = useState<SplitMethod>(expense?.splitMethod || 'equal');

  const [shares, setShares] = useState<ParticipantShare[]>(() => {
    if (expense?.participants && expense.participants.length > 0) {
      return members.map((m) => {
        const participant = expense.participants!.find((p) => p.userId === m.userId);
        const shareAmount = participant ? parseFloat(participant.shareAmount) : 0;
        return {
          userId: m.userId,
          shareAmount,
          isSelected: !!participant,
          inputValue: splitMethod === 'unequal' ? shareAmount.toString() : '',
        };
      });
    }
    return [];
  });

  const totalAmount = parseFloat(amountStr) || 0;
  const currentTotal = shares.reduce((sum, s) => sum + s.shareAmount, 0);
  const isBalanced = Math.abs(totalAmount - currentTotal) < 0.02;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amountStr || !paidByUserId || !incurredAt) return;
    if (totalAmount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }
    if (!isBalanced) {
      toast.error('The split amounts must exactly equal the total expense amount.');
      return;
    }

    const activeParticipants = shares
      .filter((s) => s.shareAmount > 0)
      .map((s) => ({
        userId: s.userId,
        shareAmount: s.shareAmount,
      }));

    if (activeParticipants.length === 0) {
      toast.error('You must include at least one participant in the split.');
      return;
    }

    setFormError(null);

    try {
      setIsSubmitting(true);

      const payload = {
        description,
        amount: totalAmount,
        category,
        paidByUserId,
        splitMethod,
        incurredAt: incurredAt.toISOString(),
        participants: activeParticipants,
      };

      if (expense) {
        await ledgerApi.updateExpense(tripId, expense.id, {
          ...payload,
          version: expense.version,
        });
        toast.success('Expense updated');
      } else {
        await ledgerApi.logExpense(tripId, payload);
        toast.success('Expense logged');
      }
      queryClient.invalidateQueries({ queryKey: ['expenses', tripId] });
      queryClient.invalidateQueries({ queryKey: ['balances', tripId] });
      queryClient.invalidateQueries({ queryKey: ['settlements', 'suggestions', tripId] });
      queryClient.invalidateQueries({ queryKey: ['budget', tripId] });
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save expense';
      toast.error(msg);
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-0 mt-4">
      <div className="flex flex-col gap-1">
        <Label
          htmlFor="expense-desc"
          className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
        >
          Description *
        </Label>
        <Input
          id="expense-desc"
          placeholder="e.g. Dinner at Luigi's"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 px-4 text-sm font-base transition-all duration-200"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="expense-amount"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Amount (Total) *
          </Label>
          <div className="relative w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold select-none">
              {getCurrencySymbol(currency || 'USD')}
            </span>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              className="pl-9 bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11 text-sm font-base transition-all duration-200 w-full"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="expense-category"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(val) => val && setCategory(val as ExpenseCategory)}
            disabled={isSubmitting}
          >
            <SelectTrigger
              id="expense-category"
              className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 w-full cursor-pointer!"
            >
              <span className="flex flex-1 text-left capitalize">
                {category === 'food_and_drinks'
                  ? 'Food & Drinks'
                  : category === 'accommodation'
                    ? 'Accommodation'
                    : category === 'transport'
                      ? 'Transport'
                      : category === 'activities'
                        ? 'Activities'
                        : category === 'miscellaneous'
                          ? 'Miscellaneous'
                          : category}
              </span>
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl p-1 overflow-hidden ring-transparent">
              <SelectItem
                value="accommodation"
                className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                  category === 'accommodation'
                    ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                    : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                }`}
              >
                Accommodation
              </SelectItem>
              <SelectItem
                value="food_and_drinks"
                className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                  category === 'food_and_drinks'
                    ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                    : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                }`}
              >
                Food & Drinks
              </SelectItem>
              <SelectItem
                value="transport"
                className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                  category === 'transport'
                    ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                    : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                }`}
              >
                Transport
              </SelectItem>
              <SelectItem
                value="activities"
                className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                  category === 'activities'
                    ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                    : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                }`}
              >
                Activities
              </SelectItem>
              <SelectItem
                value="miscellaneous"
                className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                  category === 'miscellaneous'
                    ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                    : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                }`}
              >
                Miscellaneous
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="expense-paid-by"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Paid By *
          </Label>
          <Select
            value={paidByUserId}
            onValueChange={(val) => setPaidByUserId(val || '')}
            disabled={isSubmitting || members.length === 0}
          >
            <SelectTrigger
              id="expense-paid-by"
              className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 w-full cursor-pointer!"
            >
              <span className="flex flex-1 text-left text-neutral-900 data-placeholder:text-neutral-400">
                {members.find((m) => m.userId === paidByUserId)?.user?.name ||
                  members.find((m) => m.userId === paidByUserId)?.user?.email ||
                  'Select member'}
              </span>
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl p-1 overflow-hidden ring-transparent">
              {members.map((m) => (
                <SelectItem
                  key={m.userId}
                  value={m.userId}
                  className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                    paidByUserId === m.userId
                      ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                      : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
                  }`}
                >
                  {m.user?.name || m.user?.email || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="expense-date"
            className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
          >
            Date *
          </Label>
          <Popover>
            <PopoverTrigger className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full bg-[#F6F6F6] hover:bg-[#f1f3f5] border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 text-left flex items-center justify-between cursor-pointer! disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <span className={incurredAt ? 'text-neutral-900' : 'text-neutral-400'}>
                  {incurredAt ? format(incurredAt, 'MMM d, yyyy') : 'Select date'}
                </span>
                <CalendarIcon className="h-4 w-4 text-neutral-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl overflow-hidden ring-transparent"
              align="start"
            >
              <Calendar
                mode="single"
                selected={incurredAt}
                onSelect={(date) => date && setIncurredAt(date)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label
          htmlFor="expense-split"
          className="text-sm font-semibold text-neutral-900 tracking-wide select-none"
        >
          Split Method
        </Label>
        <Select
          value={splitMethod}
          onValueChange={(val) => val && setSplitMethod(val as SplitMethod)}
          disabled={isSubmitting}
        >
          <SelectTrigger
            id="expense-split"
            className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#09a474]! rounded-xl h-11! px-4 text-sm font-base transition-all duration-200 w-full cursor-pointer!"
          >
            <span className="flex flex-1 text-left">
              {splitMethod === 'equal'
                ? 'Equally'
                : splitMethod === 'unequal'
                  ? 'Unequally (Exact amounts)'
                  : splitMethod === 'percentage'
                    ? 'By Percentages'
                    : splitMethod === 'custom'
                      ? 'By Shares (Custom)'
                      : splitMethod}
            </span>
          </SelectTrigger>
          <SelectContent className="bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl p-1 overflow-hidden ring-transparent">
            <SelectItem
              value="equal"
              className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                splitMethod === 'equal'
                  ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                  : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
              }`}
            >
              Equally
            </SelectItem>
            <SelectItem
              value="unequal"
              className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                splitMethod === 'unequal'
                  ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                  : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
              }`}
            >
              Unequally (Exact amounts)
            </SelectItem>
            <SelectItem
              value="percentage"
              className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                splitMethod === 'percentage'
                  ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                  : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
              }`}
            >
              By Percentages
            </SelectItem>
            <SelectItem
              value="custom"
              className={`rounded-lg transition-colors cursor-pointer px-4! pr-10! ${
                splitMethod === 'custom'
                  ? 'bg-[#09a474]! hover:bg-[#088f65]! focus:bg-[#088f65]! **:text-white! font-semibold'
                  : 'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800'
              }`}
            >
              By Shares (Custom)
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <SplitMethodFields
        tripId={tripId}
        totalAmount={totalAmount}
        splitMethod={splitMethod}
        value={shares}
        onChange={setShares}
        disabled={isSubmitting}
        currency={currency || 'USD'}
      />

      {formError && (
        <div className="mt-2 p-3.5 bg-red-50/80 border border-red-200/60 rounded-xl flex items-start gap-2.5 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-1 bg-white rounded-full shadow-sm border border-red-100">
            <AlertCircle className="h-4 w-4 text-red-600" />
          </div>
          <p className="text-[13.5px] leading-relaxed text-red-900/90 font-medium">{formError}</p>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <Button
          type="button"
          disabled={isSubmitting}
          onClick={onClose}
          className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#ff5d62] hover:bg-[#e04f53] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none focus-visible:ring-0!"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !description || !amountStr || !paidByUserId || !isBalanced}
          className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#09a474] hover:bg-[#088f65] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none focus-visible:ring-0!"
        >
          {isSubmitting ? 'Saving...' : 'Save Expense'}
        </Button>
      </div>
    </form>
  );
}
