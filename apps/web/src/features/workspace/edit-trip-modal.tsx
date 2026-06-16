import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { api, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { updateTripSchema, CURRENCIES } from '@wend/shared';
import type { TripWithRole } from '@wend/shared';
import type { z } from 'zod';

type EditTripFormValues = z.infer<typeof updateTripSchema>;

interface EditTripModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: TripWithRole;
}

export function EditTripModal({ open, onOpenChange, trip }: EditTripModalProps) {
  const queryClient = useQueryClient();
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    events: string[];
    data: EditTripFormValues;
  }>({ open: false, events: [], data: {} });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EditTripFormValues>({
    resolver: zodResolver(updateTripSchema),
  });

  useEffect(() => {
    if (open) {
      reset({
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        description: trip.description ?? '',
        baseCurrency: trip.baseCurrency as (typeof CURRENCIES)[number],
        estimatedBudget: trip.estimatedBudget ? Number(trip.estimatedBudget) : undefined,
      });
    }
  }, [open, trip, reset]);

  const mutation = useMutation({
    mutationFn: ({ data, force }: { data: EditTripFormValues; force: boolean }) =>
      api.patch<{ data: TripWithRole }>(
        `/api/v1/trips/${trip.id}${force ? '?force=true' : ''}`,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onOpenChange(false);
      setConflictDialog({ open: false, events: [], data: {} });
      toast.success('Trip updated');
    },
    onError: (error, variables) => {
      if (error instanceof ApiError && error.status === 409) {
        const details = error.details as { conflictingEvents?: string[] } | null;
        const events = details?.conflictingEvents ?? [];
        setConflictDialog({
          open: true,
          events,
          data: variables.data,
        });
        return;
      }
      toast.error('Failed to update trip');
    },
  });

  function onSubmit(data: EditTripFormValues) {
    mutation.mutate({ data, force: false });
  }

  function handleForceSubmit() {
    mutation.mutate({ data: conflictDialog.data, force: true });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit trip</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Trip name</Label>
              <Input id="edit-name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-destination">Destination</Label>
              <Input id="edit-destination" {...register('destination')} />
              {errors.destination && <p className="text-xs text-destructive">{errors.destination.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start date</Label>
                <Controller
                  control={control}
                  name="startDate"
                  render={({ field }) => (
                    <EditDatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                      placeholder="Start date"
                    />
                  )}
                />
                {errors.startDate && <p className="text-xs text-destructive">{errors.startDate.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Controller
                  control={control}
                  name="endDate"
                  render={({ field }) => (
                    <EditDatePicker
                      value={field.value ? new Date(field.value) : undefined}
                      onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                      placeholder="End date"
                    />
                  )}
                />
                {errors.endDate && <p className="text-xs text-destructive">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-budget">Budget (optional)</Label>
                <Input
                  id="edit-budget"
                  type="number"
                  min={0}
                  step="0.01"
                  {...register('estimatedBudget', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Controller
                  control={control}
                  name="baseCurrency"
                  render={({ field }) => (
                    <Select value={field.value ?? trip.baseCurrency} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description (optional)</Label>
              <Textarea id="edit-description" rows={3} {...register('description')} />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={conflictDialog.open}
        onOpenChange={(open) => { if (!open) setConflictDialog((prev) => ({ ...prev, open: false })); }}
        title="Date change warning"
        description={`Changing these dates will place ${conflictDialog.events.length} event${conflictDialog.events.length === 1 ? '' : 's'} outside the trip range: ${conflictDialog.events.join(', ')}. They won't be deleted, but you'll want to review them. Save anyway?`}
        confirmLabel="Save anyway"
        isPending={mutation.isPending}
        onConfirm={handleForceSubmit}
      />
    </>
  );
}

function EditDatePicker({
  value,
  onChange,
  placeholder,
}: {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
        >
          <CalendarIcon className="mr-2 size-4" />
          {value ? format(value, 'd MMM yyyy') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
