import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface TransferOrganizerModalProps {
  tripId: string;
  userId: string;
  userName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransferOrganizerModal({
  tripId,
  userId,
  userName,
  open,
  onOpenChange,
}: TransferOrganizerModalProps) {
  const queryClient = useQueryClient();
  const [isTransferring, setIsTransferring] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');

  const handleTransfer = async () => {
    if (confirmationText !== 'transfer') return;
    try {
      setIsTransferring(true);
      await travelersApi.transferOrganizer(tripId, { userId });
      toast.success(`Organizer role transferred to ${userName}.`);
      queryClient.invalidateQueries({ queryKey: ['trip', tripId] });
      queryClient.invalidateQueries({ queryKey: ['trip-members', tripId] });
      onOpenChange(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to transfer organizer role.';
      toast.error(msg);
    } finally {
      setIsTransferring(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) setConfirmationText('');
        onOpenChange(isOpen);
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[92vw] md:max-w-95 rounded-3xl md:rounded-[32px] ring-0 bg-white p-6 md:p-7 border border-black/5 shadow-2xl gap-0 font-manrope"
      >
        <DialogHeader className="text-center flex flex-col items-center justify-center">
          <DialogTitle className="text-lg md:text-xl font-bold text-neutral-900 font-syne text-center tracking-tight">
            Transfer Organizer Role
          </DialogTitle>
          <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed mt-2">
            You are about to transfer the Organizer role to{' '}
            <strong className="font-semibold text-neutral-900">{userName}</strong>.
            You will become a regular Member.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          <Label htmlFor="transfer-confirmation" className="text-xs font-semibold text-neutral-700 font-manrope">
            Type <strong className="text-amber-600">transfer</strong> to confirm
          </Label>
          <Input
            id="transfer-confirmation"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            disabled={isTransferring}
            placeholder="transfer"
            className="h-10.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 text-sm font-manrope focus-visible:ring-2 focus-visible:ring-amber-500/30"
          />
        </div>

        <div className="flex gap-2.5 md:gap-3 mt-2">
          <Button
            type="button"
            variant="waterdrop"
            disabled={isTransferring}
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
            onClick={handleTransfer}
            disabled={isTransferring || confirmationText !== 'transfer'}
            className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
              boxShadow: `
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                0 4px 14px -2px rgba(180, 83, 9, 0.4),
                0 1px 3px 0 rgba(0, 0, 0, 0.08)
              `,
            }}
          >
            {isTransferring ? 'Transferring...' : 'Transfer Role'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
