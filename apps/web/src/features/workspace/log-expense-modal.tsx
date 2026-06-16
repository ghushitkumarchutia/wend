import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { api, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import {
  logExpenseSchema,
  SplitMethod,
  EXPENSE_CATEGORIES_LIST,
} from '@wend/shared';
import type { MemberWithUser, ExpenseWithParticipants } from '@wend/shared';
import type { z } from 'zod';

type ExpenseFormValues = z.infer<typeof logExpenseSchema>;

interface LogExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  members: MemberWithUser[];
  currentUserId: string;
  currency: string;
  expense?: ExpenseWithParticipants | null;
}

const SPLIT_METHOD_OPTIONS: { value: (typeof SplitMethod)[number]; label: string }[] = [
  { value: 'equal', label: 'Equal split' },
  { value: 'unequal', label: 'Unequal amounts' },
  { value: 'percentage', label: 'Percentage split' },
  { value: 'custom', label: 'Custom amounts' },
];

export function LogExpenseModal({
  open,
  onOpenChange,
  tripId,
  members,
  currentUserId,
  currency,
  expense,
}: LogExpenseModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!expense;

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(logExpenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: 'miscellaneous',
      paidByUserId: currentUserId,
      splitMethod: 'equal',
      incurredAt: new Date().toISOString(),
      participants: members.map((m) => ({ userId: m.userId, shareAmount: 0 })),
    },
  });

  const watchedAmount = watch('amount') || 0;
  const watchedSplitMethod = watch('splitMethod');
  const watchedParticipants = watch('participants');

  const selectedParticipantIds = useMemo(
    () => new Set(watchedParticipants.map((p) => p.userId)),
    [watchedParticipants],
  );

  const participantCount = selectedParticipantIds.size;
  const equalShare = participantCount > 0 ? watchedAmount / participantCount : 0;

  const allocatedTotal = useMemo(() => {
    if (watchedSplitMethod === 'equal') return watchedAmount;
    return watchedParticipants.reduce((sum, p) => sum + (p.shareAmount || 0), 0);
  }, [watchedParticipants, watchedSplitMethod, watchedAmount]);

  const percentTotal = useMemo(() => {
    if (watchedSplitMethod !== 'percentage') return 0;
    if (watchedAmount === 0) return 0;
    return Math.round((allocatedTotal / watchedAmount) * 100);
  }, [allocatedTotal, watchedAmount, watchedSplitMethod]);

  const isSplitValid =
    watchedSplitMethod === 'equal' ||
    Math.abs(allocatedTotal - watchedAmount) < 0.01;

  useEffect(() => {
    if (open) {
      if (expense) {
        reset({
          description: expense.description,
          amount: parseFloat(expense.amount),
          category: expense.category,
          paidByUserId: expense.paidByUserId,
          splitMethod: expense.splitMethod,
          incurredAt: expense.incurredAt,
          participants: expense.participants.map((p) => ({
            userId: p.userId,
            shareAmount: parseFloat(p.shareAmount),
          })),
          receiptUrl: expense.receiptUrl ?? undefined,
        });
      } else {
        reset({
          description: '',
          amount: 0,
          category: 'miscellaneous',
          paidByUserId: currentUserId,
          splitMethod: 'equal',
          incurredAt: new Date().toISOString(),
          participants: members.map((m) => ({ userId: m.userId, shareAmount: 0 })),
        });
      }
    }
  }, [open, expense, currentUserId, members, reset]);

  function toggleParticipant(userId: string, checked: boolean) {
    const current = watchedParticipants;
    if (checked) {
      setValue('participants', [...current, { userId, shareAmount: 0 }]);
    } else {
      setValue('participants', current.filter((p) => p.userId !== userId));
    }
  }

  function updateParticipantShare(userId: string, value: number) {
    const updated = watchedParticipants.map((p) =>
      p.userId === userId ? { ...p, shareAmount: value } : p,
    );
    setValue('participants', updated);
  }

  const createMutation = useMutation({
    mutationFn: (data: ExpenseFormValues) =>
      api.post(`/api/v1/trips/${tripId}/expenses`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'settlements'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'budget'] });
      onOpenChange(false);
      toast.success('Expense logged');
    },
    onError: () => toast.error('Failed to log expense'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: ExpenseFormValues & { version: number }) =>
      api.patch(`/api/v1/trips/${tripId}/expenses/${expense!.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'expenses'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'settlements'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'budget'] });
      onOpenChange(false);
      toast.success('Expense updated');
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.error('This expense was updated by someone else. Reload and try again.', { duration: 6000 });
        queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'expenses'] });
        return;
      }
      toast.error('Failed to update expense');
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: ExpenseFormValues) {
    const finalParticipants =
      data.splitMethod === 'equal'
        ? data.participants.map((p) => ({
            userId: p.userId,
            shareAmount: parseFloat((data.amount / data.participants.length).toFixed(2)),
          }))
        : data.participants;

    const payload = { ...data, participants: finalParticipants };

    if (isEditing) {
      updateMutation.mutate({ ...payload, version: expense!.version });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Edit Expense' : 'Log Expense'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1 pt-4">
          <div className="space-y-2">
            <Label htmlFor="exp-desc">Description</Label>
            <Input id="exp-desc" placeholder="e.g. Dinner at Le Comptoir" maxLength={150} {...register('description')} />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exp-amount">Amount ({currency})</Label>
              <Input id="exp-amount" type="number" min={0.01} step="0.01" {...register('amount', { valueAsNumber: true })} />
              {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES_LIST.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Paid by</Label>
              <Controller
                control={control}
                name="paidByUserId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {members.map((m) => (
                        <SelectItem key={m.userId} value={m.userId}>{m.user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Date incurred</Label>
              <Controller
                control={control}
                name="incurredAt"
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}
                      >
                        <CalendarIcon className="mr-2 size-4" />
                        {field.value ? format(new Date(field.value), 'd MMM yyyy') : 'Pick date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => field.onChange(date ? date.toISOString() : '')}
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Split method</Label>
            <Controller
              control={control}
              name="splitMethod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SPLIT_METHOD_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Participants</Label>
            {members.length <= 1 && (
              <p className="text-xs text-muted-foreground">
                Invite more members to start splitting expenses.
              </p>
            )}
            <div className="space-y-2">
              {members.map((m) => {
                const isSelected = selectedParticipantIds.has(m.userId);
                const participantData = watchedParticipants.find((p) => p.userId === m.userId);

                return (
                  <div key={m.userId} className="flex items-center gap-3">
                    <Checkbox
                      id={`participant-${m.userId}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => toggleParticipant(m.userId, !!checked)}
                    />
                    <label htmlFor={`participant-${m.userId}`} className="min-w-0 flex-1 truncate text-sm">
                      {m.user.name}
                    </label>

                    {isSelected && watchedSplitMethod === 'equal' && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {currency} {equalShare.toFixed(2)}
                      </span>
                    )}

                    {isSelected && (watchedSplitMethod === 'unequal' || watchedSplitMethod === 'custom') && (
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        className="w-24 shrink-0"
                        value={participantData?.shareAmount || ''}
                        onChange={(e) => updateParticipantShare(m.userId, parseFloat(e.target.value) || 0)}
                      />
                    )}

                    {isSelected && watchedSplitMethod === 'percentage' && (
                      <div className="flex shrink-0 items-center gap-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step="1"
                          className="w-20"
                          value={watchedAmount > 0 ? Math.round(((participantData?.shareAmount || 0) / watchedAmount) * 100) : ''}
                          onChange={(e) => {
                            const pct = parseFloat(e.target.value) || 0;
                            updateParticipantShare(m.userId, parseFloat(((pct / 100) * watchedAmount).toFixed(2)));
                          }}
                        />
                        <span className="text-xs text-muted-foreground">%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {watchedSplitMethod !== 'equal' && (
              <div className="text-xs">
                {watchedSplitMethod === 'percentage' ? (
                  <span className={percentTotal === 100 ? 'text-emerald-600' : 'text-amber-600'}>
                    Total: {percentTotal}%
                  </span>
                ) : (
                  <span className={Math.abs(allocatedTotal - watchedAmount) < 0.01 ? 'text-emerald-600' : 'text-amber-600'}>
                    Total allocated: {currency} {allocatedTotal.toFixed(2)} / {currency} {watchedAmount.toFixed(2)}
                  </span>
                )}
              </div>
            )}
          </div>

          <SheetFooter className="gap-2 pt-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !isSplitValid}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              {isEditing ? 'Update Expense' : 'Log Expense'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
