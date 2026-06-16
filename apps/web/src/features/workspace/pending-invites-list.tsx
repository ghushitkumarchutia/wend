import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Mail, RefreshCw, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api-client';

export interface PendingInvite {
  id: string;
  invitedEmail: string;
  role: string;
  status: string;
  name: string | null;
  expiresAt: string;
  createdAt: string;
  inviterName: string;
}

interface PendingInvitesListProps {
  tripId: string;
  invites: PendingInvite[];
}

export function PendingInvitesList({ tripId, invites }: PendingInvitesListProps) {
  const queryClient = useQueryClient();

  const revokeMutation = useMutation({
    mutationFn: (inviteId: string) =>
      api.post(`/api/v1/trips/${tripId}/invites/${inviteId}/revoke`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'invites'] });
      toast.success('Invitation revoked');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to revoke invitation');
    },
  });

  const resendMutation = useMutation({
    mutationFn: (inviteId: string) =>
      api.post(`/api/v1/trips/${tripId}/invites/${inviteId}/resend`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips', tripId, 'invites'] });
      toast.success('Invitation resent');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation');
    },
  });

  if (invites.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
        Pending Invitations ({invites.length})
      </h3>
      <div className="flex flex-col gap-3">
        {invites.map((invite) => {
          const isExpired = new Date(invite.expiresAt) < new Date();

          return (
            <div
              key={invite.id}
              className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Mail className="size-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {invite.name || invite.invitedEmail}
                    </span>
                    <Badge variant="secondary" className="capitalize text-[10px]">
                      {invite.role}
                    </Badge>
                    {isExpired && (
                      <Badge variant="destructive" className="text-[10px]">
                        Expired
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {invite.name ? `${invite.invitedEmail} • ` : ''}
                    Sent {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })} by {invite.inviterName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resendMutation.mutate(invite.id)}
                  disabled={resendMutation.isPending || revokeMutation.isPending}
                >
                  <RefreshCw className="mr-2 size-3" />
                  Resend
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => revokeMutation.mutate(invite.id)}
                  disabled={resendMutation.isPending || revokeMutation.isPending}
                >
                  <XCircle className="mr-2 size-3" />
                  Revoke
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
