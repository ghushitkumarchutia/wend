import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { exploreApi } from '@/lib/api-client';
import type { Template } from '@/types/models';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CloneTemplateModalProps {
  template: Template | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CloneTemplateModal({ template, isOpen, onClose }: CloneTemplateModalProps) {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { mutate: cloneTemplate, isPending } = useMutation({
    mutationFn: (data: { tripName: string; startDate: string; endDate: string }) =>
      exploreApi.cloneTemplate(template!.id, data),
    onSuccess: (res) => {
      toast.success('Template successfully cloned!');
      onClose();
      navigate({ to: `/trips/${res.data.tripId}` });
    },
    onError: () => {
      toast.error('Failed to clone template. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !tripName || !startDate || !endDate) return;

    if (new Date(startDate) > new Date(endDate)) {
      toast.error('End date must be after start date');
      return;
    }

    cloneTemplate({ tripName, startDate, endDate });
  };

  const isFormValid = tripName.trim() !== '' && startDate !== '' && endDate !== '';

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setTripName('');
          setStartDate('');
          setEndDate('');
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2 text-primary">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Use Template</span>
          </div>
          <DialogTitle className="text-2xl">Create Your Trip</DialogTitle>
          <DialogDescription>
            We'll copy the itinerary from <strong>{template?.title}</strong> into a brand new trip.
            Just tell us when you plan to go.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="tripName">Trip Name</Label>
            <Input
              id="tripName"
              placeholder={`E.g., My ${template?.destination || 'Awesome'} Adventure`}
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || isPending} className="gap-2">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isPending ? 'Creating...' : 'Create Trip'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
