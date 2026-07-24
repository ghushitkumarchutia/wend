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
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { X, File as FileIcon } from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon, Calendar02Icon, CloudUploadIcon } from '@hugeicons/core-free-icons';
import { SplitMethodFields, type ParticipantShare } from './split-method-fields';
import { ledgerApi, travelersApi, documentsApi } from '@/lib/api-client';
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
        className="max-w-[92vw] md:max-w-120 rounded-3xl md:rounded-[32px] bg-white pt-5 pb-6 px-6 md:pt-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 max-h-[90vh] overflow-y-auto font-manrope"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center gap-1">
          <DialogTitle className="text-xl md:text-2xl font-bold text-[#10b981] font-syne text-center tracking-tight">
            {expense ? 'Edit Expense' : 'Log Expense'}
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed">
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

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [existingReceiptUrl, setExistingReceiptUrl] = useState<string | null>(
    expense?.receiptUrl || null,
  );

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

      let finalReceiptUrl = existingReceiptUrl;

      if (receiptFile) {
        const urlRes = await documentsApi.getUploadUrl(tripId, {
          fileType: receiptFile.type,
        });
        const { url, storageKey } = urlRes.data;

        const uploadRes = await fetch(url, {
          method: 'PUT',
          body: receiptFile,
          headers: {
            'Content-Type': receiptFile.type,
          },
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload receipt file');
        }

        const confirmRes = await documentsApi.confirmUpload(tripId, {
          storageKey,
          fileName: receiptFile.name,
          fileType: receiptFile.type,
          sizeBytes: receiptFile.size,
          category: 'other',
          visibility: 'shared',
        });

        finalReceiptUrl = confirmRes.data.id;
      }

      const commonPayload = {
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
          ...commonPayload,
          receiptUrl: finalReceiptUrl,
          version: expense.version,
        });
        toast.success('Expense updated');
      } else {
        await ledgerApi.logExpense(tripId, {
          ...commonPayload,
          receiptUrl: finalReceiptUrl,
        });
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

  const inputCls =
    'bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5 md:h-11 px-4 text-xs md:text-sm font-manrope text-neutral-900 placeholder:text-neutral-400 transition-all duration-200';
  const selectTriggerCls =
    'bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5! md:h-11! px-4 text-xs md:text-sm font-manrope text-neutral-900 transition-all duration-200 w-full cursor-pointer!';
  const selectContentCls =
    'bg-white/95 backdrop-blur-md border border-black/5 rounded-2xl shadow-2xl p-2 overflow-y-auto ring-transparent z-50 mt-1 max-h-56 font-manrope';
  const selectItemBase =
    'rounded-lg transition-all cursor-pointer py-2.25! px-3.5! pr-9! my-0.5 font-manrope text-sm font-medium';
  const selectItemActive =
    'text-white! hover:text-white! focus:text-white! focus:bg-[#059669]! hover:bg-[#059669]! **:text-white! hover:**:text-white! focus:**:text-white! font-semibold border border-white/30';
  const selectItemInactive =
    'hover:bg-[#09a474]/10! focus:bg-[#09a474]/10! hover:text-[#09a474]! focus:text-[#09a474]! text-neutral-800';
  const activeItemStyle = {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    boxShadow:
      'inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.4), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.2), 0 3px 10px -1px rgba(16, 185, 129, 0.35)',
  };
  const labelCls =
    'text-xs md:text-sm font-semibold font-manrope text-neutral-900 tracking-wide select-none';

  return (
    <form onSubmit={handleSubmit} className="grid gap-3.5 py-0 mt-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expense-desc" className={labelCls}>
          Description *
        </Label>
        <Input
          id="expense-desc"
          placeholder="e.g. Dinner at Luigi's"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          className={inputCls}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expense-amount" className={labelCls}>
            Amount (Total) *
          </Label>
          <div className="relative w-full">
            {(() => {
              const currencySymbol = getCurrencySymbol(currency || 'USD');
              const paddingLeftPx = Math.max(36, 14 + currencySymbol.length * 9.5 + 4);
              return (
                <>
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-semibold select-none">
                    {currencySymbol}
                  </span>
                  <Input
                    id="expense-amount"
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
                </>
              );
            })()}
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expense-category" className={labelCls}>
            Category
          </Label>
          <Select
            value={category}
            onValueChange={(val) => val && setCategory(val as ExpenseCategory)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="expense-category" className={selectTriggerCls}>
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
            <SelectContent className={selectContentCls}>
              {(
                [
                  'accommodation',
                  'food_and_drinks',
                  'transport',
                  'activities',
                  'miscellaneous',
                ] as const
              ).map((val) => {
                const isActive = category === val;
                const label =
                  val === 'food_and_drinks'
                    ? 'Food & Drinks'
                    : val === 'accommodation'
                      ? 'Accommodation'
                      : val === 'transport'
                        ? 'Transport'
                        : val === 'activities'
                          ? 'Activities'
                          : 'Miscellaneous';
                return (
                  <SelectItem
                    key={val}
                    value={val}
                    className={`${selectItemBase} ${isActive ? selectItemActive : selectItemInactive}`}
                    style={isActive ? activeItemStyle : undefined}
                  >
                    {label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expense-paid-by" className={labelCls}>
            Paid By *
          </Label>
          <Select
            value={paidByUserId}
            onValueChange={(val) => setPaidByUserId(val || '')}
            disabled={isSubmitting || members.length === 0}
          >
            <SelectTrigger id="expense-paid-by" className={selectTriggerCls}>
              <span className="flex flex-1 text-left text-neutral-900 data-placeholder:text-neutral-400">
                {members.find((m) => m.userId === paidByUserId)?.user?.name ||
                  members.find((m) => m.userId === paidByUserId)?.user?.email ||
                  'Select member'}
              </span>
            </SelectTrigger>
            <SelectContent className={selectContentCls}>
              {members.map((m) => {
                const isActive = paidByUserId === m.userId;
                return (
                  <SelectItem
                    key={m.userId}
                    value={m.userId}
                    className={`${selectItemBase} ${isActive ? selectItemActive : selectItemInactive}`}
                    style={isActive ? activeItemStyle : undefined}
                  >
                    {m.user?.name || m.user?.email || 'Unknown'}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="expense-date" className={labelCls}>
            Date *
          </Label>
          <Popover>
            <PopoverTrigger
              type="button"
              disabled={isSubmitting}
              className="w-full bg-[#F5F5F7] hover:bg-[#EEEEEF] border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-[#10b981]! rounded-xl h-10.5 md:h-11 px-3 md:px-4 text-xs md:text-sm font-manrope text-neutral-900 transition-all duration-200 text-left flex items-center justify-between cursor-pointer! disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={incurredAt ? 'text-neutral-900 font-medium' : 'text-neutral-400'}>
                {incurredAt ? format(incurredAt, 'MMM d, yyyy') : 'Select date'}
              </span>
              <HugeiconsIcon
                icon={Calendar02Icon}
                className="size-4 text-neutral-400 shrink-0"
                strokeWidth={1.75}
              />
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-white/90 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl overflow-hidden ring-transparent z-50 font-manrope"
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

      <div className="flex flex-col gap-1.5">
        <Label className={labelCls}>Receipt (Optional)</Label>

        {receiptFile ? (
          <div className="flex items-center justify-between border border-neutral-200/80 bg-[#F5F5F7] rounded-xl px-4 py-2.5 text-xs animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="flex items-center gap-2 truncate">
              <FileIcon className="h-4 w-4 text-[#10b981] shrink-0" />
              <span className="font-semibold text-neutral-800 truncate">{receiptFile.name}</span>
              <span className="text-neutral-400 font-light shrink-0">
                ({(receiptFile.size / 1024).toFixed(1)} KB)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setReceiptFile(null)}
              className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer border-none bg-transparent"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : existingReceiptUrl ? (
          <div className="flex items-center justify-between border border-neutral-200/80 bg-[#F5F5F7] rounded-xl px-4 py-2.5 text-xs animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="flex items-center gap-2 truncate">
              <FileIcon className="h-4 w-4 text-[#10b981] shrink-0" />
              <span className="font-semibold text-neutral-800 truncate">
                Current Receipt Attached
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExistingReceiptUrl(null)}
              className="text-red-500 hover:text-red-600 transition-colors p-1 cursor-pointer border-none bg-transparent"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              type="file"
              id="receipt-file-input"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={(e) => {
                const files = e.target.files;
                if (files && files[0]) {
                  setReceiptFile(files[0]);
                  setExistingReceiptUrl(null);
                }
              }}
              disabled={isSubmitting}
            />
            <label
              htmlFor="receipt-file-input"
              className="flex items-center justify-center gap-2 border border-dashed border-neutral-300 hover:border-[#10b981] rounded-xl py-3 px-4 text-xs font-semibold font-manrope text-neutral-500 hover:text-[#10b981] bg-[#F5F5F7] hover:bg-[#F5F5F7]/60 cursor-pointer transition-all duration-200 select-none"
            >
              <HugeiconsIcon
                icon={CloudUploadIcon}
                className="size-4 text-neutral-400 shrink-0"
                strokeWidth={1.75}
              />
              <span>Choose Receipt (Image or PDF)</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expense-split" className={labelCls}>
          Split Method
        </Label>
        <Select
          value={splitMethod}
          onValueChange={(val) => val && setSplitMethod(val as SplitMethod)}
          disabled={isSubmitting}
        >
          <SelectTrigger id="expense-split" className={selectTriggerCls}>
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
          <SelectContent className={selectContentCls}>
            {(
              [
                { value: 'equal', label: 'Equally' },
                { value: 'unequal', label: 'Unequally (Exact amounts)' },
                { value: 'percentage', label: 'By Percentages' },
                { value: 'custom', label: 'By Shares (Custom)' },
              ] as const
            ).map(({ value, label }) => {
              const isActive = splitMethod === value;
              return (
                <SelectItem
                  key={value}
                  value={value}
                  className={`${selectItemBase} ${isActive ? selectItemActive : selectItemInactive}`}
                  style={isActive ? activeItemStyle : undefined}
                >
                  {label}
                </SelectItem>
              );
            })}
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
          <div className="p-1 bg-white rounded-full shadow-xs border border-red-100">
            <HugeiconsIcon icon={Alert02Icon} className="h-4 w-4 text-red-600" strokeWidth={1.75} />
          </div>
          <p className="text-xs md:text-[13.5px] leading-relaxed text-red-900/90 font-medium font-manrope">
            {formError}
          </p>
        </div>
      )}

      <div className="flex gap-2.5 md:gap-3 mt-6">
        <Button
          type="button"
          variant="waterdrop"
          disabled={isSubmitting}
          onClick={onClose}
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
          disabled={isSubmitting || !description || !amountStr || !paidByUserId || !isBalanced}
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
          {isSubmitting ? 'Saving...' : 'Save Expense'}
        </Button>
      </div>
    </form>
  );
}
