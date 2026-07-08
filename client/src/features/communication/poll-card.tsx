import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { pollsApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import type { Poll, PollOption } from '@/types/models';

interface PollCardProps {
  tripId: string;
  poll: Poll;
}

export function PollCard({ tripId, poll }: PollCardProps) {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const totalVotes = poll.options?.reduce((acc, opt) => acc + (opt.votes?.length || 0), 0) || 0;
  const hasVotedOptionId = poll.options?.find(opt => opt.votes?.some(v => v.userId === user?.id))?.id;

  const handleVote = async (optionId: string) => {
    if (poll.status === 'closed' || isVoting) return;

    try {
      setIsVoting(true);
      await pollsApi.castVote(tripId, poll.id, { optionId });
    } catch {
      toast.error('Failed to cast vote');
    } finally {
      setIsVoting(false);
    }
  };

  const handleClose = async () => {
    try {
      setIsClosing(true);
      await pollsApi.closePoll(tripId, poll.id);
    } catch {
      toast.error('Failed to close poll');
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Card className={`relative overflow-hidden transition-all ${poll.status === 'closed' ? 'opacity-80' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-base leading-tight font-medium">
            {poll.question}
          </CardTitle>
          <Badge variant={poll.status === 'open' ? 'default' : 'secondary'} className="shrink-0">
            {poll.status === 'open' ? 'Active' : 'Closed'}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <span>By {poll.createdBy?.name || 'Unknown'}</span>
          <span>•</span>
          <span>{totalVotes} votes</span>
          {poll.deadline && poll.status === 'open' && (
            <>
              <span>•</span>
              <span className="text-orange-500">Ends {format(new Date(poll.deadline), 'MMM d, h:mm a')}</span>
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {poll.options?.map((option: PollOption) => {
          const votesCount = option.votes?.length || 0;
          const percentage = totalVotes > 0 ? Math.round((votesCount / totalVotes) * 100) : 0;
          const isSelected = hasVotedOptionId === option.id;

          return (
            <div 
              key={option.id} 
              className={`relative overflow-hidden rounded-md border ${
                poll.status === 'open' ? 'cursor-pointer hover:border-primary/50' : ''
              } ${isSelected ? 'border-primary bg-primary/5' : ''}`}
              onClick={() => handleVote(option.id)}
            >
              <div 
                className="absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500 ease-out" 
                style={{ width: `${percentage}%` }}
              />
              <div className="relative p-3 flex items-center justify-between text-sm">
                <span className="font-medium flex items-center gap-2">
                  {isSelected && <Check className="w-4 h-4 text-primary" />}
                  {option.text}
                </span>
                <span className="text-muted-foreground tabular-nums">
                  {percentage}% ({votesCount})
                </span>
              </div>
            </div>
          );
        })}

        {poll.status === 'open' && poll.createdByUserId === user?.id && (
          <div className="pt-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={handleClose} disabled={isClosing}>
              {isClosing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Close Poll
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
