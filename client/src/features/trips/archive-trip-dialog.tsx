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
        className="sm:max-w-[440px] rounded-2xl bg-white pt-5 md:pt-6 pb-6 px-6 md:pb-8 md:px-8 border border-neutral-200/50 shadow-2xl gap-0 animate-in fade-in-0 zoom-in-95"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center gap-1.5">
          <DialogTitle className="text-[22px] font-semibold text-[#09a474] font-heading text-center">
            Archive Trip
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-400 font-light text-center leading-relaxed">
            Archiving a trip will move it out of your active trips list and set it to read-only
            mode. You can restore it later if you need to.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            disabled={isArchiving}
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#ff5d62] hover:bg-[#e04f53] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving}
            className="flex-1 h-12 text-sm font-medium tracking-wide bg-[#09a474] hover:bg-[#088f65] text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none"
          >
            {isArchiving ? 'Archiving...' : 'Archive Trip'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
