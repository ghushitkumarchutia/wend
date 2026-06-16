import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cloneTemplateSchema, CURRENCIES } from '@wend/shared';
import type { z } from 'zod';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api-client';
import type { TripWithRole } from '@wend/shared';
import type { TemplatePreview } from './explore-page';

type CloneFormData = z.infer<typeof cloneTemplateSchema>;

interface CloneTemplateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: TemplatePreview;
}

export function CloneTemplateModal({ open, onOpenChange, template }: CloneTemplateModalProps) {
  const [activeTab, setActiveTab] = useState<'new' | 'existing'>('new');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const cloneMutation = useMutation<
    { data: { tripId: string } },
    Error,
    CloneFormData
  >({
    mutationFn: (data: CloneFormData) => api.post(`/api/v1/templates/${template.id}/clone`, data),
  });

  const { data: upcomingTripsData } = useQuery({
    queryKey: ['trips', 'upcoming'],
    queryFn: () => api.get<{ data: TripWithRole[] }>('/api/v1/trips?status=upcoming'),
    enabled: open && activeTab === 'existing',
  });

  const upcomingTrips = upcomingTripsData?.data?.filter((t) => t.role !== 'viewer') || [];

  const form = useForm<CloneFormData>({
    resolver: zodResolver(cloneTemplateSchema),
    defaultValues: {
      tripName: `${template.title} Trip`,
      destination: template.destination,
      baseCurrency: 'USD',
    },
  });

  const onSubmit = (data: CloneFormData) => {
    if (activeTab === 'new') {
      if (!data.startDate || !data.endDate) {
        toast.error('Please select travel dates');
        return;
      }
      data.existingTripId = undefined;
    } else {
      if (!data.existingTripId) {
        toast.error('Please select an existing trip');
        return;
      }
      data.tripName = undefined;
      data.startDate = undefined;
      data.endDate = undefined;
      data.destination = undefined;
    }

    cloneMutation.mutate(data, {
      onSuccess: (res) => {
        toast.success(
          activeTab === 'new'
            ? 'Trip created successfully!'
            : 'Itinerary added to existing trip!'
        );
        queryClient.invalidateQueries({ queryKey: ['trips'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        onOpenChange(false);
        navigate({ to: `/trips/${res.data.tripId}` });
      },
      onError: (error: Error) => {
        toast.error(error.message || 'Failed to clone template');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use Template</DialogTitle>
          <DialogDescription>
            Copy this itinerary into a new trip or append it to an existing one.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'new' | 'existing')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="new">Create New Trip</TabsTrigger>
            <TabsTrigger value="existing">Add to Existing</TabsTrigger>
          </TabsList>

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <TabsContent value="new" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tripName">Trip Name</Label>
                <Input id="tripName" {...form.register('tripName')} />
                {form.formState.errors.tripName && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.tripName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination">Destination</Label>
                <Input id="destination" {...form.register('destination')} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 flex flex-col">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !form.watch('startDate') && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('startDate') ? (
                          format(new Date(form.watch('startDate')!), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.watch('startDate') ? new Date(form.watch('startDate')!) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            form.setValue('startDate', date.toISOString(), { shouldValidate: true });
                            const end = new Date(date);
                            end.setDate(date.getDate() + Math.max(0, template.durationDays - 1));
                            form.setValue('endDate', end.toISOString(), { shouldValidate: true });
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2 flex flex-col">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !form.watch('endDate') && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {form.watch('endDate') ? (
                          format(new Date(form.watch('endDate')!), 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={form.watch('endDate') ? new Date(form.watch('endDate')!) : undefined}
                        onSelect={(date) => {
                          if (date) form.setValue('endDate', date.toISOString(), { shouldValidate: true });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseCurrency">Base Currency</Label>
                <Select
                  value={form.watch('baseCurrency')}
                  onValueChange={(v) =>
                    form.setValue('baseCurrency', v as (typeof CURRENCIES)[number])
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency} value={currency}>
                        {currency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="existing" className="space-y-4">
              <div className="space-y-2 flex flex-col">
                <Label htmlFor="existingTripId">Select Trip</Label>
                <Select
                  value={form.watch('existingTripId')}
                  onValueChange={(v) => form.setValue('existingTripId', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an upcoming trip..." />
                  </SelectTrigger>
                  <SelectContent>
                    {upcomingTrips.length === 0 ? (
                      <div className="p-2 text-sm text-muted-foreground">
                        No upcoming trips found where you can edit the itinerary.
                      </div>
                    ) : (
                      upcomingTrips.map((trip) => (
                        <SelectItem key={trip.id} value={trip.id}>
                          {trip.name} ({format(new Date(trip.startDate), 'MMM d, yyyy')})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  The events from this template will be scheduled starting from your trip's start
                  date.
                </p>
              </div>
            </TabsContent>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={cloneMutation.isPending}>
                {cloneMutation.isPending ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
