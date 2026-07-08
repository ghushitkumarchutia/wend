import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { activityApi } from '@/lib/api-client';
import { useSocket } from '@/components/providers/socket-provider';
import { ActivityEntryItem } from './activity-entry';
import type { ActivityEntry } from '@/types/models';
import type { ActivityListResponse } from '@/types/api';

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

    const handleNewActivity = (activity: ActivityEntry) => {
      queryClient.setQueryData(
        ['activity', tripId],
        (oldData: ActivityListResponse | undefined) => {
          if (!oldData) return oldData;
          const currentList = oldData.data.activity;
          if (currentList.find((a: ActivityEntry) => a.id === activity.id)) return oldData;

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

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Loading activity...
      </div>
    );
  if (error || !data)
    return (
      <div className="h-full flex items-center justify-center text-destructive">
        Failed to load activity
      </div>
    );

  const activities = data.data.activity;

  return (
    <div className="flex flex-col h-full absolute inset-0">
      <div className="p-4 border-b bg-background z-10 shrink-0">
        <h3 className="font-semibold">Recent Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {activities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No activity yet.</div>
        ) : (
          activities.map((activity: ActivityEntry) => (
            <ActivityEntryItem key={activity.id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
}
