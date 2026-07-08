import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pollsApi } from '@/lib/api-client';
import { useSocket } from '@/components/providers/socket-provider';
import { PollCard } from './poll-card';
import { CreatePollForm } from './create-poll-form';
import type { Poll } from '@/types/models';
import { useEffect } from 'react';

interface PollsTabProps {
  tripId: string;
}

export function PollsTab({ tripId }: PollsTabProps) {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  const { data, isLoading, error } = useQuery({
    queryKey: ['polls', tripId],
    queryFn: () => pollsApi.getPolls(tripId),
  });

  useEffect(() => {
    if (!socket) return;

    const invalidatePolls = () => {
      queryClient.invalidateQueries({ queryKey: ['polls', tripId] });
    };

    socket.on('poll:created', invalidatePolls);
    socket.on('poll:vote:updated', invalidatePolls);
    socket.on('poll:closed', invalidatePolls);
    socket.on('poll:deleted', invalidatePolls);

    return () => {
      socket.off('poll:created', invalidatePolls);
      socket.off('poll:vote:updated', invalidatePolls);
      socket.off('poll:closed', invalidatePolls);
      socket.off('poll:deleted', invalidatePolls);
    };
  }, [socket, tripId, queryClient]);

  if (isLoading)
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Loading polls...
      </div>
    );
  if (error || !data)
    return (
      <div className="h-full flex items-center justify-center text-destructive">
        Failed to load polls
      </div>
    );

  const polls = data.data.polls;

  return (
    <div className="flex flex-col h-full absolute inset-0">
      <div className="p-4 border-b flex items-center justify-between bg-background z-10 shrink-0">
        <h3 className="font-semibold">Group Polls</h3>
        <Button
          size="sm"
          onClick={() => setIsCreating(!isCreating)}
          variant={isCreating ? 'secondary' : 'default'}
        >
          {isCreating ? (
            'Cancel'
          ) : (
            <>
              <Plus className="w-4 h-4 mr-1" /> New Poll
            </>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isCreating && (
          <CreatePollForm
            tripId={tripId}
            onSuccess={() => setIsCreating(false)}
            onCancel={() => setIsCreating(false)}
          />
        )}

        {polls.length === 0 && !isCreating ? (
          <div className="text-center py-12 text-muted-foreground">
            No polls yet. Create one to get group opinions!
          </div>
        ) : (
          polls.map((poll: Poll) => <PollCard key={poll.id} poll={poll} tripId={tripId} />)
        )}
      </div>
    </div>
  );
}
