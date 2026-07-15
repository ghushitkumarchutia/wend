import { useState } from 'react';
import { useRouter } from '@tanstack/react-router';
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
import { tripApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface DeleteTripDialogProps {
  tripId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTripDialog({ tripId, open, onOpenChange }: DeleteTripDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleDelete = async () => {
    if (confirmationText !== 'delete trip') return;
    try {
      setIsDeleting(true);
      await tripApi.deleteTrip(tripId);
      toast.success('Trip deleted successfully.');
      onOpenChange(false);
      router.navigate({ to: '/dashboard' });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete trip.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[440px] rounded-2xl bg-white pt-5 md:pt-6 pb-6 px-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 animate-in fade-in-0 zoom-in-95"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center gap-1.5">
          <DialogTitle className="text-[22px] font-semibold text-red-500 font-heading text-center">
            Delete Trip
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-400 font-light text-center leading-relaxed">
            This action cannot be undone. This will permanently delete your trip and remove all
            associated itinerary events, expenses, and documents.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 mt-4">
          <Label
            htmlFor="delete-confirmation"
            className="text-xs font-medium text-neutral-700 select-none text-center"
          >
            Type <span className="font-bold text-red-500">delete trip</span> to confirm
          </Label>
          <Input
            id="delete-confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={isDeleting}
            placeholder="delete trip"
            className="bg-[#F6F6F6] hover:bg-[#f1f3f5] focus:bg-white border border-neutral-200/60 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-red-500! rounded-xl h-11 px-4 text-sm font-base text-center transition-all duration-200"
          />
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 text-sm font-medium tracking-wide bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || confirmationText !== 'delete trip'}
            className="flex-1 h-12 text-sm font-medium tracking-wide bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
          >
            {isDeleting ? 'Deleting...' : 'Delete Trip'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
