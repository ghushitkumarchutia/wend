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
        className="sm:max-w-[400px] rounded-2xl bg-white pt-6 pb-6 px-6 border border-neutral-200/50 shadow-2xl gap-0 animate-in fade-in-0 zoom-in-95"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center gap-1.5">
          <DialogTitle className="text-[20px] font-semibold text-red-500 font-heading text-center">
            Delete Event
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-400 font-light text-center leading-relaxed mt-1">
            Are you sure you want to delete <span className="font-semibold text-neutral-700">"{eventTitle}"</span>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
            className="flex-1 h-11 text-sm font-medium bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none focus-visible:ring-0!"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 h-11 text-sm font-medium bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center border-none shadow-none focus-visible:ring-0!"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
