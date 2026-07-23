import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  eventTitle: string;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  onConfirm,
  eventTitle,
}: DeleteEventDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Error handling is managed by the caller
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[92vw] md:max-w-95 rounded-3xl md:rounded-[32px] ring-0 bg-white p-6 md:p-7 border border-black/5 shadow-2xl gap-0 font-manrope"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center">
          <DialogTitle className="text-lg md:text-xl font-bold text-neutral-900 font-syne text-center tracking-tight">
            Delete Event
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed mt-2">
            Are you sure you want to delete{' '}
            <strong className="font-semibold text-neutral-900">"{eventTitle}"</strong>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2.5 md:gap-3 mt-6">
          <Button
            type="button"
            variant="waterdrop"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-neutral-800 border border-white/90"
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
            disabled={isDeleting}
            className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35"
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
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
