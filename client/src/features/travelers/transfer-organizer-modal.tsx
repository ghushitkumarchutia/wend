import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Organizer Role</DialogTitle>
          <DialogDescription>
            You are about to transfer the Organizer role to <strong>{userName}</strong>.
            You will become a regular Member and will lose the ability to manage trip settings, edit the budget, and remove members.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="transfer-confirmation">
              Type <strong>transfer</strong> to confirm.
            </Label>
            <Input
              id="transfer-confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              disabled={isTransferring}
              placeholder="transfer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isTransferring}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleTransfer}
            disabled={isTransferring || confirmationText !== 'transfer'}
          >
            {isTransferring ? 'Transferring...' : 'Transfer Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
