import { useState } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Tick04Icon,
  UserGroupIcon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  CancelCircleIcon,
  Loading02Icon,
} from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { pollsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import type { Poll, PollOption, PollVote } from '@/types/models';
import type { PollListResponse } from '@/types/api';

interface PollCardProps {
  tripId: string;
  poll: Poll;
  userRole?: string;
}

export function PollCard({ tripId, poll, userRole }: PollCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isVoting, setIsVoting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const totalVotes = poll.options?.reduce((acc, opt) => acc + (opt.votes?.length || 0), 0) || 0;
  const isOrganizer = userRole === 'organizer';

  const userVote = poll.options?.find((opt) =>
    opt.votes?.some((v) => v.userId === user?.id),
  );
  const hasVotedOptionId = userVote?.id;

  const handleVote = async (optionId: string) => {
    if (poll.status === 'closed' || isVoting) return;
    if (hasVotedOptionId === optionId) return;

    const previousData = queryClient.getQueryData(['polls', tripId]);

    queryClient.setQueryData(['polls', tripId], (old: PollListResponse | undefined) => {
      if (!old?.data?.polls) return old;
      return {
        ...old,
        data: {
          ...old.data,
          polls: old.data.polls.map((p: Poll) => {
            if (p.id !== poll.id) return p;
            return {
              ...p,
              options: p.options?.map((opt: PollOption) => {
                const filtered = (opt.votes || []).filter((v: PollVote) => v.userId !== user?.id);
                if (opt.id === optionId) {
                  return {
                    ...opt,
                    votes: [
                      ...filtered,
                      {
                        id: `opt-${Date.now()}`,
                        pollId: p.id,
                        userId: user!.id,
                        optionId,
                        votedAt: new Date().toISOString(),
                      },
                    ],
                  };
                }
                return { ...opt, votes: filtered };
              }),
            };
          }),
        },
      };
    });

    try {
      setIsVoting(true);
      await pollsApi.castVote(tripId, poll.id, { optionId });
    } catch {
      queryClient.setQueryData(['polls', tripId], previousData);
      toast.error('Failed to cast vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleClose = async () => {
    const previousData = queryClient.getQueryData(['polls', tripId]);

    queryClient.setQueryData(['polls', tripId], (old: PollListResponse | undefined) => {
      if (!old?.data?.polls) return old;
      return {
        ...old,
        data: {
          ...old.data,
          polls: old.data.polls.map((p: Poll) => {
            if (p.id !== poll.id) return p;
            return { ...p, status: 'closed', closedAt: new Date().toISOString() };
          }),
        },
      };
    });

    try {
      setIsClosing(true);
      await pollsApi.closePoll(tripId, poll.id);
    } catch {
      queryClient.setQueryData(['polls', tripId], previousData);
      toast.error('Failed to close poll');
    } finally {
      setIsClosing(false);
    }
  };

  const isClosed = poll.status === 'closed';

  return (
    <div
      className={`bg-white rounded-2xl border border-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-4 md:p-4.5 space-y-3.5 font-manrope transition-all duration-200 ${
        isClosed ? 'opacity-90 bg-white/90' : 'hover:shadow-[0_6px_24px_-4px_rgba(0,0,0,0.08)]'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <h4 className="font-syne font-semibold text-neutral-900 text-sm md:text-base leading-snug tracking-tight">
            {poll.question}
          </h4>
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-500 font-medium pt-0.5">
            <span className="flex items-center gap-1 text-neutral-600 font-semibold">
              By {poll.createdBy?.name || 'Member'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <HugeiconsIcon
                icon={UserGroupIcon}
                className="w-3 h-3 text-emerald-600"
                strokeWidth={2}
              />
              {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
            </span>
            {poll.deadline && !isClosed && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <HugeiconsIcon icon={Clock01Icon} className="w-3 h-3" strokeWidth={2} />
                  Ends {format(new Date(poll.deadline), 'MMM d, h:mm a')}
                </span>
              </>
            )}
          </div>
        </div>

        <div
          className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-syne font-bold uppercase tracking-wider ${
            isClosed
              ? 'bg-blue-50 text-blue-700 border border-blue-200/80'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <HugeiconsIcon
            icon={isClosed ? CancelCircleIcon : CheckmarkCircle02Icon}
            className="w-3 h-3"
            strokeWidth={2}
          />
          {isClosed ? 'Closed' : 'Active'}
        </div>
      </div>

      <div className="space-y-2 pt-1">
        {poll.options?.map((option: PollOption) => {
          const votesCount = option.votes?.length || 0;
          const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
          const isSelected = hasVotedOptionId === option.id;

          return (
            <div
              key={option.id}
              onClick={() => handleVote(option.id)}
              className={`relative overflow-hidden rounded-xl border transition-all duration-200 select-none ${
                !isClosed
                  ? 'cursor-pointer hover:border-emerald-400 active:scale-[0.995]'
                  : 'cursor-default'
              } ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-2xs'
                  : 'border-neutral-200/80 bg-neutral-50/40 hover:bg-neutral-50'
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ease-out ${
                  isSelected ? 'bg-emerald-400/25' : 'bg-emerald-500/10'
                }`}
                style={{ width: `${percentage}%` }}
              />

              <div className="relative p-3 flex items-center justify-between text-xs md:text-sm">
                <span className="font-semibold text-neutral-800 flex items-center gap-2 min-w-0 pr-2">
                  {isSelected && (
                    <div className="w-4.5 h-4.5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <HugeiconsIcon icon={Tick04Icon} className="w-3 h-3" strokeWidth={2.5} />
                    </div>
                  )}
                  <span className="truncate">{option.text}</span>
                </span>
                <span className="text-neutral-500 font-medium tabular-nums text-xs shrink-0">
                  {percentage}% <span className="text-neutral-400 text-[11px]">({votesCount})</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {!isClosed && (poll.createdByUserId === user?.id || isOrganizer) && (
        <div className="pt-2 flex justify-end">
          <Button
            size="sm"
            variant="waterdrop"
            onClick={handleClose}
            disabled={isClosing}
            className="h-8 px-3.5 rounded-full text-xs font-semibold font-manrope text-white border border-white/35 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #F85252 0%, #E63946 100%)',
              boxShadow: `
                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                0 4px 14px -2px rgba(230, 57, 70, 0.4),
                0 1px 3px 0 rgba(0, 0, 0, 0.08)
              `,
            }}
          >
            {isClosing ? (
              <>
                <HugeiconsIcon icon={Loading02Icon} className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Closing...
              </>
            ) : (
              'Close Poll'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
