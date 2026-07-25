import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Clock01Icon, SentIcon, Cancel01Icon } from '@hugeicons/core-free-icons';
import { travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { TripInvite } from '@/types/models';

interface PendingInvitesListProps {
  tripId: string;
  isOrganizer: boolean;
  pendingInvites: TripInvite[];
}

export function PendingInvitesList({ tripId, isOrganizer, pendingInvites }: PendingInvitesListProps) {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleResend = async (inviteId: string) => {
    try {
      setProcessingId(inviteId);
      await travelersApi.resendInvite(tripId, inviteId);
      toast.success('Invite resent successfully.');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to resend invite.';
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      setProcessingId(inviteId);
      await travelersApi.revokeInvite(tripId, inviteId);
      toast.success('Invite revoked.');
      queryClient.invalidateQueries({ queryKey: ['trip-invites', tripId] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to revoke invite.';
      toast.error(msg);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="relative w-full rounded-3xl p-1 bg-white shadow-2xs flex flex-col justify-start select-none font-manrope">
      <div
        className="w-full rounded-2xl px-4.5 md:px-5 pt-4 md:pt-5 pb-5 md:pb-6 flex flex-col justify-start transition-colors"
        style={{
          background: 'linear-gradient(to top, #FDE68A 0%, #FFFFFF 100%)', // Amber-200 fading to pure white at top
        }}
      >
        <div className="pb-4">
          <h3 className="text-lg md:text-xl font-semibold tracking-wide text-neutral-900 font-syne flex items-center gap-2">
            <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-amber-600" strokeWidth={2.2} />
            Pending Invites ({pendingInvites.length})
          </h3>
          <p className="text-[11px] md:text-xs text-neutral-500 font-manrope mt-0.5">
            People who haven't accepted their invitations yet.
          </p>
        </div>

        <div className="space-y-3 relative z-10">
          {pendingInvites.map((invite) => {
            const initial = (invite.name || invite.invitedEmail).charAt(0).toUpperCase();

            return (
              <div
                key={invite.id}
                className="relative w-full rounded-[13px] border border-white/90 backdrop-blur-md transition-all duration-300 overflow-hidden flex items-center justify-between p-2.5 md:p-3 gap-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, #FFFBEB 100%)',
                  boxShadow: `
                    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                    inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
                    0 4px 12px -2px rgba(0, 0, 0, 0.08),
                    0 1px 3px 0 rgba(217, 119, 6, 0.25)
                  `,
                }}
              >
                <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/90 via-white/40 to-transparent pointer-events-none" />

                <div className="relative z-10 flex items-center gap-3 min-w-0">
                  <Avatar className="h-9 w-9 md:h-10 md:w-10 border border-white/80 shadow-xs shrink-0">
                    <AvatarFallback className="bg-amber-100 text-amber-800 font-semibold font-syne text-xs md:text-sm border border-amber-200/60">
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-semibold text-neutral-800 font-manrope leading-snug truncate">
                      {invite.name || invite.invitedEmail}
                    </p>
                    {invite.name && (
                      <p className="text-[11px] md:text-xs text-neutral-500 font-manrope truncate mt-0.5">
                        {invite.invitedEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 shrink-0">
                  <Badge className="bg-amber-100/90 text-amber-800 border border-amber-300/60 font-medium text-[10px] tracking-wider px-2.5 py-1 rounded-full capitalize font-manrope shadow-2xs">
                    {invite.role}
                  </Badge>

                  {isOrganizer && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100/80 transition-colors cursor-pointer"
                        disabled={processingId === invite.id}
                        onClick={() => handleResend(invite.id)}
                        title="Resend Invite"
                      >
                        <HugeiconsIcon icon={SentIcon} className="size-4" strokeWidth={2} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-100/80 transition-colors cursor-pointer"
                        disabled={processingId === invite.id}
                        onClick={() => handleRevoke(invite.id)}
                        title="Revoke Invite"
                      >
                        <HugeiconsIcon icon={Cancel01Icon} className="size-4.5" strokeWidth={2} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
