import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '@/lib/api-client';
import { useSocket } from '@/components/providers/socket-provider';
import { ActivityEntryItem } from './activity-entry';
import type { ActivityEntry } from '@/types/models';
import type { ActivityListResponse } from '@/types/api';
import { HugeiconsIcon } from '@hugeicons/react';
import { Loading02Icon, AlertCircleIcon, Notification03Icon } from '@hugeicons/core-free-icons';

interface ActivityTabProps {
  tripId: string;
}

export function ActivityTab({ tripId }: ActivityTabProps) {
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data, isLoading, error } = useQuery({
    queryKey: ['activity', tripId],
    queryFn: () => activityApi.getActivity(tripId),
  });

  useEffect(() => {
    if (!socket) return;

    socket.emit('trip:join', tripId);

    const handleNewActivity = (activity: ActivityEntry) => {
      queryClient.setQueryData(
        ['activity', tripId],
        (oldData: ActivityListResponse | undefined) => {
          if (!oldData?.data?.activity) return oldData;
          const currentList = oldData.data.activity;
          if (currentList.some((a: ActivityEntry) => a.id === activity.id)) return oldData;

          return {
            ...oldData,
            data: {
              ...oldData.data,
              activity: [activity, ...currentList],
            },
          };
        },
      );
    };

    socket.on('activity:new', handleNewActivity);

    return () => {
      socket.off('activity:new', handleNewActivity);
    };
  }, [socket, tripId, queryClient]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground font-manrope">
        <HugeiconsIcon
          icon={Loading02Icon}
          className="w-6 h-6 md:w-7 md:h-7 animate-spin text-emerald-600"
        />
        <span className="text-xs md:text-sm font-medium">Loading activity feed...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 p-4 text-center font-manrope">
        <HugeiconsIcon icon={AlertCircleIcon} className="w-8 h-8 md:w-9 md:h-9 text-rose-500" />
        <p className="text-xs md:text-sm font-semibold text-foreground">
          Failed to load activity feed
        </p>
        <p className="text-[11px] md:text-xs text-muted-foreground">
          Please try switching tabs or check your connection.
        </p>
      </div>
    );
  }

  const activities = data?.data?.activity ?? [];

  return (
    <div className="flex flex-col h-full absolute inset-0 font-manrope">
      <div className="p-3.5 md:p-4 border-b bg-background/95 backdrop-blur-xs z-10 shrink-0 flex items-center justify-between">
        <h3 className="font-bold text-base md:text-lg font-syne text-foreground tracking-tight">
          Recent Activity
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto px-3.5 md:px-4 pt-1.5 md:pt-2 pb-4 space-y-3 md:space-y-3.5">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center gap-2 text-muted-foreground font-manrope">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-muted/40 border flex items-center justify-center">
              <HugeiconsIcon
                icon={Notification03Icon}
                className="w-6 h-6 md:w-7 md:h-7 text-neutral-400"
              />
            </div>
            <p className="text-xs md:text-sm font-medium text-foreground mt-1">No activity yet</p>
            <p className="text-[11px] md:text-xs text-muted-foreground max-w-xs">
              Actions taken by trip members will appear here in real-time.
            </p>
          </div>
        ) : (
          activities.map((activity: ActivityEntry) => (
            <ActivityEntryItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}
