import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, UserMinus, ArrowRightLeft } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { api } from '@/lib/api-client';
import { getInitials } from '@/lib/utils';
import type { MemberWithUser, TripWithRole, TripMemberRole } from '@wend/shared';

interface MembersListProps {
  trip: TripWithRole;
  members: MemberWithUser[];
  currentUserId: string;
  onTransferOrganizer: () => void;
}

export function MembersList({
  trip,
  members,
  currentUserId,
  onTransferOrganizer,
}: MembersListProps) {
  const queryClient = useQueryClient();
  const [memberToRemove, setMemberToRemove] = useState<MemberWithUser | null>(null);

  const currentUserRole = trip.role;
  const isOrganizer = currentUserRole === 'organizer';

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: TripMemberRole }) =>
      api.patch(`/api/v1/trips/${trip.id}/members/${userId}/role`, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'members'] });
      toast.success('Role updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/api/v1/trips/${trip.id}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', trip.id, 'members'] });
      toast.success('Member removed');
      setMemberToRemove(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member');
      setMemberToRemove(null);
    },
  });

  // Sort members: organizer first, then by joined date
  const sortedMembers = [...members].sort((a, b) => {
    if (a.role === 'organizer' && b.role !== 'organizer') return -1;
    if (a.role !== 'organizer' && b.role === 'organizer') return 1;
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime();
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Trip Members ({members.length})
      </h3>
      
      <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
        <ul className="divide-y">
          {sortedMembers.map((member) => {
            const isMe = member.userId === currentUserId;
            
            return (
              <li key={member.userId} className="flex items-center justify-between p-4 sm:px-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-10">
                    {member.user.image ? (
                      <AvatarImage src={member.user.image} alt={member.user.name} />
                    ) : null}
                    <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {member.user.name} {isMe && <span className="text-muted-foreground font-normal">(You)</span>}
                      </span>
                      {member.role === 'organizer' && (
                        <Badge variant="default" className="text-[10px] h-5 uppercase tracking-wider">
                          Organizer
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {member.user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-xs text-muted-foreground mr-4">
                    Joined {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                  </div>

                  {isOrganizer && !isMe && member.role !== 'organizer' ? (
                    <Select
                      defaultValue={member.role}
                      onValueChange={(val) => 
                        roleMutation.mutate({ userId: member.userId, role: val as TripMemberRole })
                      }
                      disabled={roleMutation.isPending}
                    >
                      <SelectTrigger className="w-[110px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    member.role !== 'organizer' && (
                      <Badge variant="secondary" className="capitalize text-[10px]">
                        {member.role}
                      </Badge>
                    )
                  )}

                  {isOrganizer && !isMe && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" className="h-8 w-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {member.role !== 'organizer' && (
                          <DropdownMenuItem onClick={() => setMemberToRemove(member)}>
                            <UserMinus className="mr-2 size-4" />
                            Remove member
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}

                  {isOrganizer && isMe && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-xs" className="h-8 w-8">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onTransferOrganizer}>
                          <ArrowRightLeft className="mr-2 size-4" />
                          Transfer organizer role
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <ConfirmDialog
        open={!!memberToRemove}
        onOpenChange={(open) => !open && setMemberToRemove(null)}
        title="Remove member"
        description={
          memberToRemove
            ? `Remove ${memberToRemove.user.name} from this trip? They will lose access to all trip content. Their expense history will be preserved.`
            : ''
        }
        confirmLabel="Remove"
        variant="destructive"
        isPending={removeMutation.isPending}
        onConfirm={() => {
          if (memberToRemove) {
            removeMutation.mutate(memberToRemove.userId);
          }
        }}
      />
    </div>
  );
}
