import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, UserMinus, Shield, ShieldAlert, LogOut } from 'lucide-react';
import { travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { TripMember } from '@/types/models';
import { TransferOrganizerModal } from './transfer-organizer-modal';
import { LeaveTripDialog } from './leave-trip-dialog';

interface MemberRowProps {
  tripId: string;
  member: TripMember;
  isOrganizer: boolean;
  isCurrentUser: boolean;
  canLeave: boolean;
}

export function MemberRow({
  tripId,
  member,
  isOrganizer,
  isCurrentUser,
  canLeave,
}: MemberRowProps) {
  const queryClient = useQueryClient();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const initials = member.user.name
    ? member.user.name.substring(0, 2).toUpperCase()
    : member.user.email.substring(0, 2).toUpperCase();

  const handleRoleChange = async (newRole: 'member' | 'viewer') => {
    try {
      setIsUpdating(true);
      await travelersApi.changeRole(tripId, member.userId, { role: newRole });
      toast.success(`${member.user.name || member.user.email}'s role updated to ${newRole}.`);
      queryClient.invalidateQueries({ queryKey: ['trip-members', tripId] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update role.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    try {
      setIsUpdating(true);
      await travelersApi.removeMember(tripId, member.userId);
      toast.success(`${member.user.name || member.user.email} removed from the trip.`);
      queryClient.invalidateQueries({ queryKey: ['trip-members', tripId] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to remove member.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between space-x-4 py-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-10 w-10">
          <AvatarImage src={member.user.image || undefined} alt={member.user.name || ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium leading-none">
            {member.user.name || 'Unknown User'} {isCurrentUser && '(You)'}
          </p>
          <p className="text-sm text-muted-foreground">{member.user.email}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge
          variant={member.role === 'organizer' ? 'default' : 'secondary'}
          className="capitalize"
        >
          {member.role}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger disabled={isUpdating} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isCurrentUser && (
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                disabled={!canLeave}
                onClick={() => setIsLeaveDialogOpen(true)}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Leave Trip
              </DropdownMenuItem>
            )}

            {!isCurrentUser && isOrganizer && (
              <>
                <DropdownMenuItem
                  disabled={member.role === 'member'}
                  onClick={() => handleRoleChange('member')}
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Make Member
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={member.role === 'viewer'}
                  onClick={() => handleRoleChange('viewer')}
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Make Viewer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsTransferModalOpen(true)}>
                  <Shield className="mr-2 h-4 w-4 text-primary" />
                  Transfer Organizer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={handleRemove}
                >
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove from Trip
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <TransferOrganizerModal
          tripId={tripId}
          userId={member.userId}
          userName={member.user.name || member.user.email}
          open={isTransferModalOpen}
          onOpenChange={setIsTransferModalOpen}
        />

        {isCurrentUser && (
          <LeaveTripDialog
            tripId={tripId}
            open={isLeaveDialogOpen}
            onOpenChange={setIsLeaveDialogOpen}
          />
        )}
      </div>
    </div>
  );
}
