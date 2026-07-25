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
import { HugeiconsIcon } from '@hugeicons/react';
import {
  LogoutSquare01Icon,
  UserRemove01Icon,
  UserCheck01Icon,
  ShieldKeyIcon,
  MoreHorizontalIcon,
} from '@hugeicons/core-free-icons';
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

  const initial = member.user.name
    ? member.user.name.charAt(0).toUpperCase()
    : member.user.email.charAt(0).toUpperCase();

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
    <>
      <div
        className="relative w-full rounded-[13px] border border-white/90 backdrop-blur-md transition-all duration-300 overflow-hidden flex items-center justify-between p-2.5 md:p-3 gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, #F5F3FF 100%)',
          boxShadow: `
            inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
            inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
            0 4px 12px -2px rgba(0, 0, 0, 0.08),
            0 1px 3px 0 rgba(124, 58, 237, 0.2)
          `,
        }}
      >
        <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3 min-w-0">
          <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-white/80 shadow-xs shrink-0">
            <AvatarImage src={member.user.image || undefined} alt={member.user.name || ''} />
            <AvatarFallback className="bg-purple-100 text-purple-700 font-semibold font-syne text-xs md:text-sm border border-purple-200/60">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm font-semibold text-neutral-800 font-manrope leading-snug truncate">
              {member.user.name || 'Unknown User'}{' '}
              {isCurrentUser && <span className="text-purple-600 font-semibold text-xs">(You)</span>}
            </p>
            <p className="text-[11px] md:text-xs text-neutral-500 font-manrope truncate mt-0.5">
              {member.user.email}
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 shrink-0">
          {member.role === 'organizer' ? (
            <Badge className="bg-amber-100/90 text-amber-800 border border-amber-300/60 font-semibold text-[10px] tracking-wider px-2.5 py-1 rounded-full capitalize font-manrope shadow-2xs">
              Organizer
            </Badge>
          ) : member.role === 'viewer' ? (
            <Badge className="bg-sky-100/90 text-sky-800 border border-sky-300/60 font-medium text-[10px] tracking-wider px-2.5 py-1 rounded-full capitalize font-manrope shadow-2xs">
              Viewer
            </Badge>
          ) : (
            <Badge className="bg-purple-100/90 text-purple-800 border border-purple-300/60 font-medium text-[10px] tracking-wider px-2.5 py-1 rounded-full capitalize font-manrope shadow-2xs">
              Member
            </Badge>
          )}

          {(isCurrentUser || isOrganizer) && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger
                disabled={isUpdating}
                className="inline-flex items-center justify-center rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/50 data-[state=open]:bg-neutral-200/70 h-8 w-8 p-0 shrink-0 transition-colors cursor-pointer focus-visible:outline-none"
              >
                <span className="sr-only">Open menu</span>
                <HugeiconsIcon
                  icon={MoreHorizontalIcon}
                  className="h-4 w-4 text-neutral-700"
                  strokeWidth={2}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-auto min-w-44 bg-white/98 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl p-1.5 font-manrope z-50 overflow-hidden"
              >
                {isCurrentUser && (
                  <DropdownMenuItem
                    className="text-red-600! hover:text-red-600! focus:text-red-600! hover:bg-red-50! focus:bg-red-50! rounded-xl cursor-pointer font-medium text-xs whitespace-nowrap transition-colors py-2! px-3! flex items-center"
                    disabled={!canLeave}
                    onClick={() => setIsLeaveDialogOpen(true)}
                  >
                    <HugeiconsIcon
                      icon={LogoutSquare01Icon}
                      className="mr-2.5 size-4 text-red-600 shrink-0"
                      strokeWidth={2}
                    />
                    <span>Leave Trip</span>
                  </DropdownMenuItem>
                )}

                {!isCurrentUser && isOrganizer && (
                  <>
                    <DropdownMenuItem
                      disabled={member.role === 'member'}
                      onClick={() => handleRoleChange('member')}
                      className="text-slate-700! hover:text-slate-900! focus:text-slate-900! hover:bg-slate-100! focus:bg-slate-100! rounded-xl cursor-pointer font-medium text-xs whitespace-nowrap transition-colors py-2! px-3! flex items-center"
                    >
                      <HugeiconsIcon
                        icon={UserCheck01Icon}
                        className="mr-2.5 size-4 text-emerald-600 shrink-0"
                        strokeWidth={2}
                      />
                      <span>Make Member</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={member.role === 'viewer'}
                      onClick={() => handleRoleChange('viewer')}
                      className="text-slate-700! hover:text-slate-900! focus:text-slate-900! hover:bg-slate-100! focus:bg-slate-100! rounded-xl cursor-pointer font-medium text-xs whitespace-nowrap transition-colors py-2! px-3! flex items-center"
                    >
                      <HugeiconsIcon
                        icon={UserCheck01Icon}
                        className="mr-2.5 size-4 text-sky-600 shrink-0"
                        strokeWidth={2}
                      />
                      <span>Make Viewer</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsTransferModalOpen(true)}
                      className="text-slate-700! hover:text-slate-900! focus:text-slate-900! hover:bg-slate-100! focus:bg-slate-100! rounded-xl cursor-pointer font-medium text-xs whitespace-nowrap transition-colors py-2! px-3! flex items-center"
                    >
                      <HugeiconsIcon
                        icon={ShieldKeyIcon}
                        className="mr-2.5 size-4 text-amber-600 shrink-0"
                        strokeWidth={2}
                      />
                      <span>Transfer Organizer</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-200/80 my-1" />
                    <DropdownMenuItem
                      className="text-red-600! hover:text-red-600! focus:text-red-600! hover:bg-red-50! focus:bg-red-50! rounded-xl cursor-pointer font-medium text-xs whitespace-nowrap transition-colors py-2! px-3! flex items-center"
                      onClick={handleRemove}
                    >
                      <HugeiconsIcon
                        icon={UserRemove01Icon}
                        className="mr-2.5 size-4 text-red-600 shrink-0"
                        strokeWidth={2}
                      />
                      <span>Remove from Trip</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

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
    </>
  );
}
