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
  FileText,
} from 'lucide-react';
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification03Icon } from '@hugeicons/core-free-icons';
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
    filter === 'all' ? n.status !== 'archived' : n.status === 'unread',
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
    <div className="flex flex-col h-125 w-full font-manrope">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-200/50">
        <h2 className="font-bold text-sm md:text-base font-syne text-neutral-900 tracking-tight">
          Notifications
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs font-semibold px-2.5 rounded-lg text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending || notifications.every((n) => n.status !== 'unread')}
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            <span>Mark all read</span>
          </Button>
        </div>
      </div>

      <div className="px-4 py-2 border-b border-neutral-200/50 bg-slate-50/50 flex justify-center">
        <nav
          className="inline-flex items-center gap-1 p-1 rounded-full bg-white border border-black/5 shadow-[0_4px_20px_rgb(0,0,0,0.06)] font-manrope select-none h-9 w-44"
          aria-label="Notification Filter"
        >
          {(['all', 'unread'] as const).map((id) => {
            const isActive = filter === id;
            const label = id === 'all' ? 'All' : 'Unread';

            if (isActive) {
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilter(id)}
                  className="relative flex-1 inline-flex items-center justify-center h-full rounded-full text-white font-semibold text-xs cursor-pointer select-none shrink-0 group focus:outline-none transition-all duration-200 active:scale-[0.97]"
                  style={{
                    background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                    boxShadow: `
                      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
                      0 4px 12px -2px rgba(16, 185, 129, 0.45),
                      0 2px 4px 0 rgba(0, 0, 0, 0.1)
                    `,
                  }}
                >
                  <div className="absolute inset-x-2 top-0.5 h-1 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
                  <span className="relative z-10 leading-none tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] whitespace-nowrap -translate-y-px">
                    {label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className="flex-1 inline-flex items-center justify-center h-full rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80 font-medium text-xs transition-all duration-150 cursor-pointer shrink-0 group"
              >
                <span className="leading-none whitespace-nowrap tracking-wide -translate-y-px">
                  {label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <ScrollArea className="flex-1 font-manrope">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-t-transparent" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-75 h-full py-12 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100/90 border border-neutral-200/60 flex items-center justify-center mb-3 shadow-2xs">
              <HugeiconsIcon
                icon={Notification03Icon}
                className="size-6 text-neutral-400"
                strokeWidth={1.5}
              />
            </div>
            <p className="text-base font-semibold font-syne text-neutral-800">No notifications</p>
            <p className="text-xs text-neutral-500 font-manrope mt-1">
              {filter === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex gap-3 p-3.5 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors group ${
                  notification.status === 'unread' ? 'bg-emerald-50/40' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <div
                    className={`p-2 rounded-full ${
                      notification.status === 'unread'
                        ? 'bg-white shadow-2xs border border-emerald-200/50'
                        : 'bg-neutral-100'
                    }`}
                  >
                    {getIcon(notification.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    to={getLink(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className="block outline-none"
                  >
                    <p className="text-xs md:text-sm leading-relaxed text-neutral-800 font-manrope">
                      <span className="font-bold text-neutral-900">{notification.actorName}</span>{' '}
                      <span className="text-neutral-500 font-normal">
                        {notification.type === 'TRIP_INVITE' && 'invited you to'}
                        {notification.type === 'TRIP_UPDATE' && 'updated the trip'}
                        {notification.type === 'EXPENSE_ADDED' && 'added a new expense in'}
                        {notification.type === 'CHAT_MENTION' && 'mentioned you in'}
                        {notification.type === 'DOCUMENT_ADDED' && 'uploaded a document to'}
                      </span>{' '}
                      <span className="font-semibold text-neutral-900">
                        {notification.tripName}
                      </span>
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-[11px] text-neutral-400 font-medium">
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
                      className="h-6 w-6 text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 cursor-pointer"
                      onClick={() => markAsRead.mutate(notification.id)}
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
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
