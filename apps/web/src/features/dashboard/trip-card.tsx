import { Link } from '@tanstack/react-router';
import { format, differenceInDays, formatDistanceToNow } from 'date-fns';
import { Users, MoreVertical } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TripWithRole } from '@wend/shared';

interface TripCardProps {
  trip: TripWithRole;
  viewMode: 'grid' | 'list';
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  upcoming: 'default',
  ongoing: 'secondary',
  completed: 'outline',
  archived: 'outline',
};

function getContextText(trip: TripWithRole): string {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  if (trip.status === 'upcoming') {
    const days = differenceInDays(start, now);
    if (days === 0) return 'Starts today';
    if (days === 1) return 'Starts tomorrow';
    return `Starts in ${days} days`;
  }

  if (trip.status === 'ongoing') {
    const totalDays = differenceInDays(end, start) + 1;
    const currentDay = differenceInDays(now, start) + 1;
    return `Day ${currentDay} of ${totalDays}`;
  }

  if (trip.status === 'completed') {
    return `Ended ${formatDistanceToNow(end, { addSuffix: true })}`;
  }

  return 'Archived';
}

function getDurationDays(trip: TripWithRole): number {
  return differenceInDays(new Date(trip.endDate), new Date(trip.startDate)) + 1;
}

export function TripCard({ trip, viewMode }: TripCardProps) {
  const duration = getDurationDays(trip);
  const contextText = getContextText(trip);
  const dateRange = `${format(new Date(trip.startDate), 'd MMM')} – ${format(new Date(trip.endDate), 'd MMM yyyy')}`;

  if (viewMode === 'list') {
    return (
      <Link to="/trips/$tripId" params={{ tripId: trip.id }}>
        <Card className="transition-colors hover:bg-accent/50">
          <CardContent className="flex items-center gap-4 p-4">
            <div
              className="hidden size-16 shrink-0 rounded-lg bg-cover bg-center sm:block"
              style={{
                backgroundImage: trip.coverImageUrl
                  ? `url(${trip.coverImageUrl})`
                  : 'linear-gradient(135deg, oklch(0.488 0.243 264.376), oklch(0.627 0.265 303.9))',
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">{trip.name}</p>
                <Badge variant={STATUS_VARIANT[trip.status]} className="shrink-0 capitalize">
                  {trip.status}
                </Badge>
              </div>
              <p className="truncate text-sm text-muted-foreground">{trip.destination}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>{dateRange}</span>
                <span>·</span>
                <span>{contextText}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {trip.memberCount}
                </span>
              </div>
            </div>
            <Badge variant="outline" className="hidden shrink-0 capitalize sm:inline-flex">
              {trip.role}
            </Badge>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="overflow-hidden transition-colors hover:bg-accent/50">
      <Link to="/trips/$tripId" params={{ tripId: trip.id }}>
        <div
          className="relative h-36 bg-cover bg-center"
          style={{
            backgroundImage: trip.coverImageUrl
              ? `url(${trip.coverImageUrl})`
              : 'linear-gradient(135deg, oklch(0.488 0.243 264.376), oklch(0.627 0.265 303.9))',
          }}
        >
          <Badge
            variant={STATUS_VARIANT[trip.status]}
            className="absolute right-2 top-2 capitalize"
          >
            {trip.status}
          </Badge>
          <Badge variant="secondary" className="absolute bottom-2 left-2">
            {duration} {duration === 1 ? 'day' : 'days'}
          </Badge>
        </div>
      </Link>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <Link to="/trips/$tripId" params={{ tripId: trip.id }} className="min-w-0 flex-1">
            <p className="truncate font-semibold">{trip.name}</p>
            <p className="truncate text-sm text-muted-foreground">{trip.destination}</p>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-xs" className="shrink-0">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {trip.role === 'organizer' ? (
                <>
                  <DropdownMenuItem>Edit trip</DropdownMenuItem>
                  <DropdownMenuItem>Archive trip</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Delete trip</DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem>Leave trip</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{dateRange}</p>
        <p className="text-xs text-muted-foreground">{contextText}</p>
        <div className="mt-3 flex items-center gap-2">
          <Badge variant="outline" className="capitalize">{trip.role}</Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3" />
            {trip.memberCount} {trip.memberCount === 1 ? 'member' : 'members'}
          </span>
          {trip.estimatedBudget && (
            <span className="text-xs text-muted-foreground">
              Budget: {trip.baseCurrency} {Number(trip.estimatedBudget).toLocaleString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
