import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { CheckCheck, BellOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api-client';
import type { NotificationWithMeta } from '@wend/shared';

interface NotificationPanelProps {
  onClose: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', 'recent'],
    queryFn: () =>
      api.get<{ data: NotificationWithMeta[]; nextCursor: string | null }>(
        '/api/v1/notifications?limit=10',
      ),
  });

  const markAllRead = useMutation({
    mutationFn: () => api.post<void>('/api/v1/notifications/mark-all-read'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data ?? [];

  function getNotificationHref(n: NotificationWithMeta): string {
    if (n.tripId) return `/trips/${n.tripId}`;
    return '/notifications';
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h4 className="text-sm font-semibold">Notifications</h4>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || notifications.length === 0}
        >
          <CheckCheck className="mr-1 size-3" />
          Mark all read
        </Button>
      </div>

      <ScrollArea className="max-h-80">
        {isLoading && (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="size-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <BellOff className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        )}

        {!isLoading &&
          notifications.map((n) => (
            <Link
              key={n.id}
              to={getNotificationHref(n)}
              onClick={onClose}
              className={`flex gap-3 border-b px-4 py-3 transition-colors hover:bg-accent ${n.status === 'unread' ? 'bg-accent/40' : ''}`}
            >
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm">
                  {n.actorName && (
                    <span className="font-medium">{n.actorName} </span>
                  )}
                  {formatNotificationMessage(n)}
                </p>
                {n.tripName && (
                  <p className="truncate text-xs text-muted-foreground">
                    {n.tripName}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {n.status === 'unread' && (
                <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
              )}
            </Link>
          ))}
      </ScrollArea>

      <Separator />
      <div className="p-2">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block rounded-md py-1.5 text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}

function formatNotificationMessage(n: NotificationWithMeta): string {
  const messages: Record<string, string> = {
    trip_invite_received: 'invited you to a trip',
    invite_accepted: 'accepted your invite',
    invite_declined: 'declined your invite',
    member_joined: 'joined the trip',
    member_left: 'left the trip',
    member_removed: 'was removed from the trip',
    role_changed: 'role was changed',
    organizer_transferred: 'is now the organizer',
    event_created: 'added a new event',
    event_updated: 'updated an event',
    event_cancelled: 'cancelled an event',
    expense_added: 'added an expense',
    expense_updated: 'updated an expense',
    settlement_recorded: 'recorded a settlement',
    poll_created: 'created a poll',
    poll_closed: 'closed a poll',
    poll_vote_changed: 'changed their vote',
    document_uploaded: 'uploaded a document',
    document_deleted: 'deleted a document',
    trip_departure_reminder: 'Your trip is coming up soon',
    event_reminder: 'You have an upcoming event',
    security_new_sign_in: 'New sign-in detected on your account',
    security_password_changed: 'Your password was changed',
    security_email_changed: 'Your email was changed',
    message_mention: 'mentioned you in a message',
  };
  return messages[n.type] ?? 'sent you a notification';
}
