import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { ActivityEntry } from '@/types/models';

interface ActivityEntryItemProps {
  activity: ActivityEntry;
}

export function ActivityEntryItem({ activity }: ActivityEntryItemProps) {
  const getIcon = () => {
    switch (activity.type) {
      case 'trip_created':
        return '🌍';
      case 'member_joined':
        return '👋';
      case 'member_left':
        return '🚪';
      case 'member_removed':
        return '🚫';
      case 'role_changed':
        return '👑';
      case 'expense_logged':
        return '💸';
      case 'expense_updated':
        return '📝';
      case 'expense_deleted':
        return '🗑️';
      case 'settlement_logged':
        return '🤝';
      case 'itinerary_added':
        return '📅';
      case 'itinerary_updated':
        return '✏️';
      case 'itinerary_deleted':
        return '❌';
      case 'document_uploaded':
        return '📄';
      case 'document_deleted':
        return '🗑️';
      case 'poll_created':
        return '📊';
      case 'poll_closed':
        return '🔒';
      default:
        return '🔔';
    }
  };

  const getMessage = () => {
    const actor = activity.actor?.name || 'Someone';

    // Some basic mapping, backend can send more descriptive messages in metadata if needed,
    // but we can also build them here based on type.
    switch (activity.type) {
      case 'trip_created':
        return `${actor} created the trip.`;
      case 'member_joined':
        return `${actor} joined the trip.`;
      case 'expense_logged':
        return `${actor} added an expense.`;
      case 'settlement_logged':
        return `${actor} recorded a settlement.`;
      case 'itinerary_added':
        return `${actor} added a new itinerary event.`;
      case 'document_uploaded':
        return `${actor} uploaded a document.`;
      case 'poll_created':
        return `${actor} created a poll.`;
      default:
        return `${actor} performed an action (${activity.type.replace(/_/g, ' ')}).`;
    }
  };

  const initials = activity.actor?.name?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex gap-3 py-2">
      <div className="relative">
        <Avatar className="w-8 h-8">
          <AvatarImage src={activity.actor?.image || undefined} />
          <AvatarFallback className="text-xs bg-muted">{initials}</AvatarFallback>
        </Avatar>
        <div className="absolute -bottom-1 -right-1 text-sm bg-background rounded-full leading-none">
          {getIcon()}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground wrap-break-word">{getMessage()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
