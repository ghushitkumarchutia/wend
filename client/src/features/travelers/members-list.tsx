import { MemberRow } from './member-row';
import { useAuth } from '@/hooks/use-auth';
import type { TripMember } from '@/types/models';

interface MembersListProps {
  tripId: string;
  isOrganizer: boolean;
  members: TripMember[];
}

export function MembersList({ tripId, isOrganizer, members }: MembersListProps) {
  const { user } = useAuth();

  if (!members.length) {
    return null;
  }

  const organizersCount = members.filter((m) => m.role === 'organizer').length;

  return (
    <div className="relative w-full rounded-3xl p-1 bg-white shadow-2xs flex flex-col justify-start select-none font-manrope">
      <div
        className="w-full rounded-2xl px-4.5 md:px-5 pt-4 md:pt-5 pb-5 md:pb-6 flex flex-col justify-start transition-colors"
        style={{
          background: 'linear-gradient(to top, #DDD6FE 0%, #FFFFFF 100%)',
        }}
      >
        <div className="pb-4">
          <h3 className="text-lg md:text-xl font-semibold tracking-wide text-neutral-900 font-syne">
            Travelers ({members.length})
          </h3>
          <p className="text-[11px] md:text-xs text-neutral-500 font-manrope mt-0.5">
            People who have joined this trip.
          </p>
        </div>

        <div className="space-y-3 relative z-10">
          {members.map((member) => {
            const isCurrentUser = member.userId === user?.id;
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
        </div>
      </div>
    </div>
  );
}
