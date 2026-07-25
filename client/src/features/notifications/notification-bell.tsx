import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api-client';
import { useSocket } from '@/components/providers/socket-provider';
import { useAuth } from '@/hooks/use-auth';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { HugeiconsIcon } from '@hugeicons/react';
import { Notification03Icon } from '@hugeicons/core-free-icons';
import { NotificationPanel } from './notification-panel';

export function NotificationBell() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['unread-notifications-count'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60000,
    enabled: !!user,
  });

  const unreadCount = data?.data.count || 0;

  useEffect(() => {
    if (!socket || !user) return;

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('notification:new', handleNewNotification);

    return () => {
      socket.off('notification:new', handleNewNotification);
    };
  }, [socket, user, queryClient]);

  return (
    <Popover>
      <PopoverTrigger className="relative h-9 w-9 inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer">
        <HugeiconsIcon
          icon={Notification03Icon}
          className="h-5 w-5 text-muted-foreground"
          strokeWidth={1.75}
        />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
        )}
        <span className="sr-only">Toggle notifications</span>
      </PopoverTrigger>
      <PopoverContent
        className="w-90 md:w-96 bg-white/95 backdrop-blur-xl border border-neutral-200/50 rounded-2xl shadow-2xl p-0 gap-0 overflow-hidden ring-transparent font-manrope"
        align="end"
        sideOffset={8}
      >
        <NotificationPanel />
      </PopoverContent>
    </Popover>
  );
}
