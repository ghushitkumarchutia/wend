import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { notificationsApi } from '@/lib/api-client';
import type { AppNotification } from '@/types/models';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  MessageSquare, 
  PlaneTakeoff, 
  Wallet,
  Clock,
  Trash2,
  FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface NotificationPanelProps {
  onClose?: () => void;
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
    },
  });

  const archive = useMutation({
    mutationFn: (id: string) => notificationsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data.notifications || [];
  const filteredNotifications = notifications.filter((n) => 
    filter === 'all' ? n.status !== 'archived' : n.status === 'unread'
  );

  const getIcon = (type: string) => {
    switch (type) {
      case 'TRIP_INVITE':
      case 'TRIP_UPDATE':
        return <PlaneTakeoff className="h-4 w-4 text-blue-500" />;
      case 'CHAT_MENTION':
        return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'EXPENSE_ADDED':
      case 'PAYMENT_REMINDER':
        return <Wallet className="h-4 w-4 text-orange-500" />;
      case 'DOCUMENT_ADDED':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getLink = (notification: AppNotification) => {
    if (!notification.tripId) return '/dashboard';
    switch (notification.type) {
      case 'TRIP_INVITE':
      case 'TRIP_UPDATE':
        return `/trips/${notification.tripId}`;
      case 'EXPENSE_ADDED':
      case 'PAYMENT_REMINDER':
        return `/trips/${notification.tripId}/ledger`;
      case 'DOCUMENT_ADDED':
        return `/trips/${notification.tripId}/documents`;
      case 'CHAT_MENTION':
        return `/trips/${notification.tripId}`;
      default:
        return `/trips/${notification.tripId}`;
    }
  };

  const handleNotificationClick = (notification: AppNotification) => {
    if (notification.status === 'unread') {
      markAsRead.mutate(notification.id);
    }
    onClose?.();
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-sm">Notifications</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending || notifications.every(n => n.status !== 'unread')}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Mark all read
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/30">
        <Button
          variant={filter === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs rounded-full px-3"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs rounded-full px-3"
          onClick={() => setFilter('unread')}
        >
          Unread
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {filter === 'unread' ? "You're all caught up!" : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors ${
                  notification.status === 'unread' ? 'bg-primary/5' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div className={`p-2 rounded-full ${notification.status === 'unread' ? 'bg-background shadow-sm' : 'bg-muted'}`}>
                    {getIcon(notification.type)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <Link 
                    to={getLink(notification)} 
                    onClick={() => handleNotificationClick(notification)}
                    className="block outline-none"
                  >
                    <p className="text-sm leading-tight text-foreground">
                      <span className="font-semibold">{notification.actorName}</span>
                      {' '}
                      <span className="text-muted-foreground">
                        {notification.type === 'TRIP_INVITE' && 'invited you to'}
                        {notification.type === 'TRIP_UPDATE' && 'updated the trip'}
                        {notification.type === 'EXPENSE_ADDED' && 'added a new expense in'}
                        {notification.type === 'CHAT_MENTION' && 'mentioned you in'}
                        {notification.type === 'DOCUMENT_ADDED' && 'uploaded a document to'}
                      </span>
                      {' '}
                      <span className="font-medium text-foreground">{notification.tripName}</span>
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </div>
                  </Link>
                </div>

                <div className="shrink-0 flex flex-col gap-1 opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
                  {notification.status === 'unread' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={() => markAsRead.mutate(notification.id)}
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => archive.mutate(notification.id)}
                    title="Archive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
