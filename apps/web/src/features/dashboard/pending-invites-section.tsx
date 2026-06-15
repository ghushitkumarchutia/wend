import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import { useSession } from '@/lib/auth-client';
import type { TripMemberRole } from '@wend/shared';

interface PendingInvite {
  id: string;
  tripId: string;
  tripName: string;
  destination: string;
  inviterName: string;
  role: TripMemberRole;
  token: string;
  createdAt: string;
}

export function PendingInvitesSection() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['invites', 'pending'],
    queryFn: () => api.get<{ data: PendingInvite[] }>('/api/v1/trips/invites/pending'),
    enabled: !!session,
  });

  const acceptMutation = useMutation({
    mutationFn: (token: string) =>
      api.post<{ data: { tripId: string } }>('/api/v1/trips/invites/accept', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Invite accepted');
    },
    onError: () => {
      toast.error('Failed to accept invite');
    },
  });

  const declineMutation = useMutation({
    mutationFn: (token: string) =>
      api.post<void>('/api/v1/trips/invites/decline', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Invite declined');
    },
    onError: () => {
      toast.error('Failed to decline invite');
    },
  });

  const invites = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (invites.length === 0) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Trip Invites</h2>
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{invite.tripName}</p>
                <Badge variant="secondary" className="shrink-0 capitalize">
                  {invite.role}
                </Badge>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span>{invite.destination}</span>
                <span>·</span>
                <span>Invited by {invite.inviterName}</span>
                <span>·</span>
                <span>{formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}</span>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                onClick={() => acceptMutation.mutate(invite.token)}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                <Check className="mr-1 size-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => declineMutation.mutate(invite.token)}
                disabled={acceptMutation.isPending || declineMutation.isPending}
              >
                <X className="mr-1 size-4" />
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
