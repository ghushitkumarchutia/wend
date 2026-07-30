import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Chart01Icon,
  Add01Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { pollsApi } from '@/lib/api-client';
import { useSocket } from '@/components/providers/socket-provider';
import { PollCard } from './poll-card';
import { CreatePollForm } from './create-poll-form';
import type { Poll, PollOption, PollVote } from '@/types/models';
import type { PollListResponse } from '@/types/api';

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

    socket.emit('trip:join', tripId);

    const handlePollCreated = (data: { poll: Poll }) => {
      queryClient.setQueryData(['polls', tripId], (old: PollListResponse | undefined) => {
        if (!old?.data?.polls) return old;
        if (old.data.polls.some((p: Poll) => p.id === data.poll.id)) return old;
        return { ...old, data: { ...old.data, polls: [data.poll, ...old.data.polls] } };
      });
    };

    const handleVoteUpdated = (data: { pollId: string; userId: string; optionId: string }) => {
      queryClient.setQueryData(['polls', tripId], (old: PollListResponse | undefined) => {
        if (!old?.data?.polls) return old;
        return {
          ...old,
          data: {
            ...old.data,
            polls: old.data.polls.map((p: Poll) => {
              if (p.id !== data.pollId) return p;
              return {
                ...p,
                options: p.options?.map((opt: PollOption) => {
                  const filtered = (opt.votes || []).filter((v: PollVote) => v.userId !== data.userId);
                  if (opt.id === data.optionId) {
                    return { ...opt, votes: [...filtered, { id: `ws-${Date.now()}`, pollId: data.pollId, userId: data.userId, optionId: data.optionId, votedAt: new Date().toISOString() }] };
                  }
                  return { ...opt, votes: filtered };
                }),
              };
            }),
          },
        };
      });
    };

    const handlePollClosed = (data: { pollId: string }) => {
      queryClient.setQueryData(['polls', tripId], (old: PollListResponse | undefined) => {
        if (!old?.data?.polls) return old;
        return {
          ...old,
          data: {
            ...old.data,
            polls: old.data.polls.map((p: Poll) => {
              if (p.id !== data.pollId) return p;
              return { ...p, status: 'closed', closedAt: new Date().toISOString() };
            }),
          },
        };
      });
    };

    const handlePollDeleted = (data: { pollId: string }) => {
      queryClient.setQueryData(['polls', tripId], (old: PollListResponse | undefined) => {
        if (!old?.data?.polls) return old;
        return { ...old, data: { ...old.data, polls: old.data.polls.filter((p: Poll) => p.id !== data.pollId) } };
      });
    };

    socket.on('poll:created', handlePollCreated);
    socket.on('poll:vote:updated', handleVoteUpdated);
    socket.on('poll:closed', handlePollClosed);
    socket.on('poll:deleted', handlePollDeleted);

    return () => {
      socket.off('poll:created', handlePollCreated);
      socket.off('poll:vote:updated', handleVoteUpdated);
      socket.off('poll:closed', handlePollClosed);
      socket.off('poll:deleted', handlePollDeleted);
    };
  }, [socket, tripId, queryClient]);

  if (isLoading)
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 space-y-4 bg-[#F5F5F7]">
        <div className="w-full max-w-md space-y-3">
          <div className="h-28 bg-white/60 backdrop-blur-sm rounded-2xl animate-pulse border border-black/5" />
          <div className="h-28 bg-white/60 backdrop-blur-sm rounded-2xl animate-pulse border border-black/5" />
        </div>
      </div>
    );

  if (error || !data)
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#F5F5F7] font-manrope">
        <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5" strokeWidth={2} />
        </div>
        <p className="text-sm font-semibold text-neutral-800">Failed to load polls</p>
        <p className="text-xs text-neutral-500 mt-1">Please check your connection and try again.</p>
      </div>
    );

  const rawPolls = data?.data?.polls ?? [];
  const polls = [...rawPolls].sort(
    (a: Poll, b: Poll) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-[#F5F5F7] font-manrope select-none">
      <div className="px-4 py-3 border-b border-neutral-200/70 bg-white/80 backdrop-blur-md flex items-center justify-between z-10 shrink-0 shadow-2xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <HugeiconsIcon icon={Chart01Icon} className="w-4 h-4" strokeWidth={2} />
          </div>
          <h3 className="font-syne font-bold text-sm text-neutral-900 tracking-tight">Group Polls</h3>
        </div>

        <Button
          size="sm"
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="h-8 px-3.5 rounded-full text-xs font-semibold font-manrope text-white border border-white/35 cursor-pointer transition-all active:scale-95"
          style={
            isCreating
              ? {
                  background: 'linear-gradient(135deg, #F85252 0%, #E63946 100%)',
                  boxShadow: `
                    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                    inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                    0 4px 14px -2px rgba(230, 57, 70, 0.4),
                    0 1px 3px 0 rgba(0, 0, 0, 0.08)
                  `,
                }
              : {
                  background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                  boxShadow: `
                    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                    inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                    0 4px 14px -2px rgba(16, 185, 129, 0.35)
                  `,
                }
          }
        >
          {isCreating ? (
            'Cancel'
          ) : (
            <span className="flex items-center gap-1.5">
              <HugeiconsIcon icon={Add01Icon} className="w-3.5 h-3.5" strokeWidth={2.5} /> New Poll
            </span>
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-3.5 md:p-4 space-y-3.5 no-scrollbar">
        {isCreating && (
          <CreatePollForm
            tripId={tripId}
            onSuccess={() => setIsCreating(false)}
            onCancel={() => setIsCreating(false)}
          />
        )}

        {polls.length === 0 && !isCreating ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center my-auto">
            <div className="w-12 h-12 rounded-2xl bg-white border border-black/5 shadow-xs flex items-center justify-center text-emerald-600 mb-3">
              <HugeiconsIcon icon={Chart01Icon} className="w-6 h-6" strokeWidth={1.8} />
            </div>
            <h4 className="font-syne font-bold text-sm text-neutral-800">No polls created yet</h4>
            <p className="text-xs text-neutral-500 font-manrope max-w-64 mt-1 leading-relaxed">
              Create a group poll to decide on activities, food places, or travel plans together!
            </p>
          </div>
        ) : (
          polls.map((poll: Poll) => <PollCard key={poll.id} poll={poll} tripId={tripId} />)
        )}
      </div>
    </div>
  );
}
