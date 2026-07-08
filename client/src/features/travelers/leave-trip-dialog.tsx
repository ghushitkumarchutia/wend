import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface LeaveTripDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeaveTripDialog({ tripId, open, onOpenChange }: LeaveTripDialogProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);

  const handleLeave = async () => {
    try {
      setIsLeaving(true);
      await travelersApi.leaveTrip(tripId);
      toast.success('You have left the trip.');
      onOpenChange(false);
      router.navigate({ to: '/dashboard' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to leave trip.';
      toast.error(msg);
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Trip</DialogTitle>
          <DialogDescription>
            Are you sure you want to leave this trip? You will lose access to the itinerary, expenses, and chat.
            An organizer will need to invite you back if you change your mind.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLeaving}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleLeave} disabled={isLeaving}>
            {isLeaving ? 'Leaving...' : 'Leave Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
