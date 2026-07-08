import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SplitMethodFields, type ParticipantShare } from './split-method-fields';
import { ledgerApi, travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { Expense, ExpenseCategory, SplitMethod } from '@/types/models';

interface LogExpenseModalProps {
  tripId: string;
  expense?: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogExpenseModal({ tripId, expense, open, onOpenChange }: LogExpenseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
          <DialogDescription>
            {expense
              ? 'Update the details for this shared expense.'
              : 'Record a new shared expense for this trip.'}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ExpenseForm tripId={tripId} expense={expense} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface ExpenseFormProps {
  tripId: string;
  expense?: Expense;
  onClose: () => void;
}

function ExpenseForm({ tripId, expense, onClose }: ExpenseFormProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: membersData } = useQuery({
    queryKey: ['travelers', tripId],
    queryFn: () => travelersApi.getMembers(tripId),
  });
  const members = membersData?.data.members || [];

  const [description, setDescription] = useState(expense?.description || '');
  const [amountStr, setAmountStr] = useState(expense?.amount || '');
  const [category, setCategory] = useState<ExpenseCategory>(expense?.category || 'food_and_drinks');
  const [paidByUserId, setPaidByUserId] = useState(expense?.paidByUserId || '');

  const getInitialIncurredAt = () => {
    if (expense?.incurredAt) {
      const d = new Date(expense.incurredAt);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  };
  const [incurredAt, setIncurredAt] = useState(getInitialIncurredAt);
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

    try {
      setIsSubmitting(true);

      const payload = {
        description,
        amount: totalAmount,
        category,
        paidByUserId,
        splitMethod,
        incurredAt: new Date(incurredAt).toISOString(),
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="expense-desc">Description *</Label>
        <Input
          id="expense-desc"
          placeholder="e.g. Dinner at Luigi's"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expense-amount">Amount (Total) *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              $
            </span>
            <Input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              className="pl-7"
              placeholder="0.00"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-category">Category</Label>
          <Select
            value={category}
            onValueChange={(val) => val && setCategory(val as ExpenseCategory)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="expense-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="accommodation">Accommodation</SelectItem>
              <SelectItem value="food_and_drinks">Food & Drinks</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
              <SelectItem value="activities">Activities</SelectItem>
              <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expense-paid-by">Paid By *</Label>
          <Select 
            value={paidByUserId} 
            onValueChange={(val) => setPaidByUserId(val || '')} 
            disabled={isSubmitting || members.length === 0}
          >
            <SelectTrigger id="expense-paid-by">
              <SelectValue placeholder="Select a member" />
            </SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  {m.user?.name || m.user?.email || 'Unknown'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="expense-date">Date & Time *</Label>
          <Input
            id="expense-date"
            type="datetime-local"
            value={incurredAt}
            onChange={(e) => setIncurredAt(e.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t mt-4">
        <Label htmlFor="expense-split">Split Method</Label>
        <Select
          value={splitMethod}
          onValueChange={(val) => val && setSplitMethod(val as SplitMethod)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="expense-split">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="equal">Equally</SelectItem>
            <SelectItem value="unequal">Unequally (Exact amounts)</SelectItem>
            <SelectItem value="percentage">By Percentages</SelectItem>
            <SelectItem value="custom">By Shares (Custom)</SelectItem>
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
      />

      <DialogFooter className="pt-4 border-t mt-4">
        <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !description || !amountStr || !paidByUserId || !isBalanced}
        >
          {isSubmitting ? 'Saving...' : 'Save Expense'}
        </Button>
      </DialogFooter>
    </form>
  );
}
