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
        className="max-w-[92vw] md:max-w-105 rounded-3xl md:rounded-[32px] ring-0 bg-white p-6 md:p-7 border border-black/5 shadow-2xl gap-0 font-manrope"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center">
          <DialogTitle className="text-xl md:text-2xl font-bold text-rose-500 font-syne text-center tracking-tight">
            Delete Trip
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed mt-2">
            This action cannot be undone. This will permanently delete your trip and remove all
            associated itinerary events, expenses, and documents.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5 mt-5">
          <Label
            htmlFor="delete-confirmation"
            className="text-xs md:text-sm font-medium font-manrope text-neutral-700 select-none text-center"
          >
            Type <span className="font-bold text-rose-500">delete trip</span> to confirm
          </Label>
          <Input
            id="delete-confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={isDeleting}
            placeholder="delete trip"
            className="bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-rose-500! rounded-xl h-10.5 md:h-11 px-4 text-xs md:text-sm font-manrope text-center text-neutral-900 placeholder:text-neutral-400 transition-all duration-200"
          />
        </div>

        <div className="flex gap-2.5 md:gap-3 mt-6">
          <Button
            type="button"
            variant="waterdrop"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-neutral-800 border border-white/90 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
              boxShadow: `
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.08),
                0 4px 12px -2px rgba(0, 0, 0, 0.08),
                0 1px 3px 0 rgba(0, 0, 0, 0.05)
              `,
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="waterdrop"
            onClick={handleDelete}
            disabled={isDeleting || confirmationText !== 'delete trip'}
            className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
            {isDeleting ? 'Deleting...' : 'Delete Trip'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
