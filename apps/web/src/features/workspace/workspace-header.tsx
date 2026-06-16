import { Link } from '@tanstack/react-router';
import { format, differenceInDays } from 'date-fns';
import {
  ArrowLeft,
  Users,
  Calendar,
  DollarSign,
  MoreVertical,
  UserPlus,
  Pencil,
  Archive,
  ArchiveRestore,
  Trash2,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { TripWithRole, MemberWithUser } from '@wend/shared';

interface WorkspaceHeaderProps {
  trip: TripWithRole;
  members: MemberWithUser[];
  onInvite?: () => void;
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete?: () => void;
  onLeave?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function StatusCard({ trip }: { trip: TripWithRole }) {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  if (trip.status === 'upcoming') {
    const days = differenceInDays(start, now);
    const label =
      days <= 0 ? 'Starts today' : days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`;
    return (
      <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
        <p className="text-sm font-medium text-white">{label}</p>
      </div>
    );
  }

  if (trip.status === 'ongoing') {
    const totalDays = differenceInDays(end, start) + 1;
    const currentDay = Math.min(differenceInDays(now, start) + 1, totalDays);
    const percent = Math.round((currentDay / totalDays) * 100);
    return (
      <div className="min-w-[140px] space-y-1 rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
        <p className="text-sm font-medium text-white">
          Day {currentDay} of {totalDays}
        </p>
        <Progress
          value={percent}
          className="h-1.5 bg-white/20 *:data-[slot=progress-indicator]:bg-white"
        />
      </div>
    );
  }

  if (trip.status === 'completed') {
    return (
      <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
        <p className="text-sm font-medium text-white">Trip completed</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur-sm">
      <p className="text-sm font-medium text-white">Archived</p>
    </div>
  );
}

export function WorkspaceHeader({
  trip,
  members,
  onInvite,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  onLeave,
}: WorkspaceHeaderProps) {
  const isOrganizer = trip.role === 'organizer';
  const dateRange = `${format(new Date(trip.startDate), 'd MMM yyyy')} – ${format(new Date(trip.endDate), 'd MMM yyyy')}`;
  const displayedMembers = members.slice(0, 5);
  const remainingCount = members.length - displayedMembers.length;

  return (
    <div
      className="relative bg-cover bg-center"
      style={{
        backgroundImage: trip.coverImageUrl
          ? `url(${trip.coverImageUrl})`
          : 'linear-gradient(135deg, oklch(0.488 0.243 264.376), oklch(0.627 0.265 303.9))',
      }}
    >
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/50 to-black/30" />
      <div className="relative mx-auto max-w-7xl space-y-4 px-4 pb-6 pt-4 sm:px-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-white/80 hover:text-white"
        >
          <ArrowLeft className="size-4" />
          My Trips
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <Badge className="bg-white/20 text-white uppercase tracking-wider">
              {trip.destination}
            </Badge>
            <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">{trip.name}</h1>
            {trip.description && (
              <p className="line-clamp-2 text-sm text-white/70">{trip.description}</p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                {dateRange}
              </span>
              {trip.estimatedBudget && (
                <span className="flex items-center gap-1.5">
                  <DollarSign className="size-3.5" />
                  Budget: {trip.baseCurrency} {Number(trip.estimatedBudget).toLocaleString()}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5" />
                {trip.memberCount} {trip.memberCount === 1 ? 'member' : 'members'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusCard trip={trip} />

            <AvatarGroup>
              {displayedMembers.map((m) => (
                <Avatar key={m.userId} size="sm">
                  {m.user.image ? <AvatarImage src={m.user.image} alt={m.user.name} /> : null}
                  <AvatarFallback>{getInitials(m.user.name)}</AvatarFallback>
                </Avatar>
              ))}
              {remainingCount > 0 && <AvatarGroupCount>+{remainingCount}</AvatarGroupCount>}
            </AvatarGroup>

            <div className="flex items-center gap-2">
              {isOrganizer && onInvite && (
                <Button size="sm" variant="secondary" onClick={onInvite}>
                  <UserPlus className="mr-1.5 size-3.5" />
                  Invite
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon-sm" variant="secondary">
                    <MoreVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {isOrganizer ? (
                    <>
                      <DropdownMenuItem onClick={onEdit}>
                        <Pencil className="mr-2 size-3.5" />
                        Edit Trip
                      </DropdownMenuItem>
                      {trip.status === 'archived' ? (
                        <DropdownMenuItem onClick={onRestore}>
                          <ArchiveRestore className="mr-2 size-3.5" />
                          Restore Trip
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={onArchive}>
                          <Archive className="mr-2 size-3.5" />
                          Archive Trip
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={onDelete}
                      >
                        <Trash2 className="mr-2 size-3.5" />
                        Delete Trip
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuItem onClick={onLeave}>
                      <LogOut className="mr-2 size-3.5" />
                      Leave Trip
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
