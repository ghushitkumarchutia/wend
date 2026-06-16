import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api-client';
import { getInitials } from '@/lib/utils';
import type { MemberWithUser, TripWithRole } from '@wend/shared';

interface TransferOrganizerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trip: TripWithRole;
  members: MemberWithUser[];
  currentUserId: string;
}

export function TransferOrganizerModal({
  open,
  onOpenChange,
  trip,
  members,
  currentUserId,
}: TransferOrganizerModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const queryClient = useQueryClient();

  const eligibleMembers = members.filter(
    (m) => m.userId !== currentUserId && m.role !== 'organizer',
  );

  const transferMutation = useMutation({
    mutationFn: (newOrgId: string) =>
      api.post(`/api/v1/trips/${trip.id}/members/transfer`, { userId: newOrgId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id] });
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'members'] });
      toast.success('Organizer role transferred successfully');
      onOpenChange(false);
      setSelectedUserId('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to transfer organizer role');
    },
  });

  const handleTransfer = () => {
    if (!selectedUserId) return;
    transferMutation.mutate(selectedUserId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Organizer Role</DialogTitle>
          <DialogDescription>
            Select a member to become the new organizer. You will be downgraded to a regular
            member. This action cannot be undone without their permission.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a member..." />
            </SelectTrigger>
            <SelectContent>
              {eligibleMembers.map((m) => (
                <SelectItem key={m.userId} value={m.userId}>
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      {m.user.image ? (
                        <AvatarImage src={m.user.image} alt={m.user.name} />
                      ) : null}
                      <AvatarFallback className="text-xs">
                        {getInitials(m.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{m.user.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={transferMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleTransfer}
            disabled={!selectedUserId || transferMutation.isPending}
          >
            {transferMutation.isPending ? 'Transferring...' : 'Transfer role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
