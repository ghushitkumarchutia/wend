import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { travelersApi } from '@/lib/api-client';
import { MemberRow } from './member-row';
import { useAuth } from '@/hooks/use-auth';

interface MembersListProps {
  tripId: string;
  isOrganizer: boolean;
}

export function MembersList({ tripId, isOrganizer }: MembersListProps) {
  const { user } = useAuth();
  const { data, isLoading, error } = useQuery({
    queryKey: ['trip-members', tripId],
    queryFn: () => travelersApi.getMembers(tripId),
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground p-4">Loading members...</div>;
  }

  if (error || !data) {
    return <div className="text-sm text-destructive p-4">Failed to load members.</div>;
  }

  const members = data.data.members;
  const organizersCount = members.filter(m => m.role === 'organizer').length;

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0">
        <CardTitle>Travelers ({members.length})</CardTitle>
        <CardDescription>
          People who have joined this trip.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 divide-y">
        {members.map((member) => {
          const isCurrentUser = member.userId === user?.id;
          // You can only leave if you are not an organizer, or if there is more than 1 organizer.
          const canLeave = member.role !== 'organizer' || organizersCount > 1;

          return (
            <MemberRow
              key={member.id}
              tripId={tripId}
              member={member}
              isOrganizer={isOrganizer}
              isCurrentUser={isCurrentUser}
              canLeave={canLeave}
            />
          );
        })}
      </CardContent>
    </Card>
  );
}
