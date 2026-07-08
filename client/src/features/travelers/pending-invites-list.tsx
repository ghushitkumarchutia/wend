import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, X, Clock } from 'lucide-react';
import { travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';

interface PendingInvitesListProps {
  tripId: string;
  isOrganizer: boolean;
}

export function PendingInvitesList({ tripId, isOrganizer }: PendingInvitesListProps) {
  const queryClient = useQueryClient();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['trip-invites', tripId],
    queryFn: () => travelersApi.getPendingInvites(tripId),
  });

  if (isLoading) {
    return null; // Silent load
  }

  if (error || !data) {
    return null;
  }

  const pendingInvites = data.data.invites.filter((inv) => inv.status === 'pending');

  if (pendingInvites.length === 0) {
    return null;
  }

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
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          Pending Invites ({pendingInvites.length})
        </CardTitle>
        <CardDescription>
          People who haven't accepted their invitations yet.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 divide-y">
        {pendingInvites.map((invite) => (
          <div key={invite.id} className="flex items-center justify-between space-x-4 py-4">
            <div>
              <p className="text-sm font-medium leading-none">
                {invite.name || invite.invitedEmail}
              </p>
              <p className="text-sm text-muted-foreground">{invite.invitedEmail}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {invite.role}
              </Badge>
              {isOrganizer && (
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={processingId === invite.id}
                    onClick={() => handleResend(invite.id)}
                    title="Resend Invite"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={processingId === invite.id}
                    onClick={() => handleRevoke(invite.id)}
                    title="Revoke Invite"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
