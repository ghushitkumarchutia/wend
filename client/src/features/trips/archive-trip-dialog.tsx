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
      <DialogContent
        showCloseButton={false}
        className="max-w-[92vw] md:max-w-105 rounded-3xl md:rounded-[32px] ring-0 bg-white p-6 md:p-7 border border-black/5 shadow-2xl gap-0 font-manrope"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center">
          <DialogTitle className="text-xl md:text-2xl font-bold text-neutral-900 font-syne text-center tracking-tight">
            Archive Trip
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed mt-2">
            Archiving a trip will move it out of your active trips list and set it to read-only
            mode. You can restore it later if you need to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2.5 md:gap-3 mt-6">
          <Button
            type="button"
            variant="waterdrop"
            disabled={isArchiving}
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
            onClick={handleArchive}
            disabled={isArchiving}
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
            {isArchiving ? 'Archiving...' : 'Archive Trip'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
