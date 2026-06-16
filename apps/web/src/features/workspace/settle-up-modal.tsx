import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { api } from '@/lib/api-client';
import { settleUpSchema } from '@wend/shared';
import type { MemberWithUser, SettlementSuggestion } from '@wend/shared';
import type { z } from 'zod';

type SettleUpFormValues = z.infer<typeof settleUpSchema>;

interface SettleUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripId: string;
  members: MemberWithUser[];
  suggestion?: SettlementSuggestion | null;
}

export function SettleUpModal({ open, onOpenChange, tripId, members, suggestion }: SettleUpModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SettleUpFormValues>({
    resolver: zodResolver(settleUpSchema),
  });

  useEffect(() => {
    if (open) {
      if (suggestion) {
        reset({
          fromUserId: suggestion.fromUserId,
          toUserId: suggestion.toUserId,
          amount: parseFloat(suggestion.amount),
        });
      } else {
        reset({
          fromUserId: members[0]?.userId ?? '',
          toUserId: members[1]?.userId ?? '',
          amount: 0,
        });
      }
    }
  }, [open, suggestion, members, reset]);

  const mutation = useMutation({
    mutationFn: (data: SettleUpFormValues) =>
      api.post(`/api/v1/trips/${tripId}/settlements`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'balances'] });
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'settlements'] });
      onOpenChange(false);
      toast.success('Settlement recorded');
    },
    onError: () => toast.error('Failed to record settlement'),
  });

  function onSubmit(data: SettleUpFormValues) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settle Up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>From</Label>
            <Controller
              control={control}
              name="fromUserId"
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
            <Label>To</Label>
            <Controller
              control={control}
              name="toUserId"
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
            <Label htmlFor="settle-amount">Amount</Label>
            <Input
              id="settle-amount"
              type="number"
              min={0.01}
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Record Settlement
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
