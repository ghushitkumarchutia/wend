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
import { tripApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface ArchiveTripDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ArchiveTripDialog({ tripId, open, onOpenChange }: ArchiveTripDialogProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    try {
      setIsArchiving(true);
      await tripApi.archiveTrip(tripId);
      toast.success('Trip archived successfully.');
      onOpenChange(false);
      router.navigate({ to: '/dashboard' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to archive trip.';
      toast.error(msg);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Archive Trip</DialogTitle>
          <DialogDescription>
            Archiving a trip will move it out of your active trips list and set it to read-only mode.
            You can restore it later if you need to.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isArchiving}>
            Cancel
          </Button>
          <Button onClick={handleArchive} disabled={isArchiving}>
            {isArchiving ? 'Archiving...' : 'Archive Trip'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
