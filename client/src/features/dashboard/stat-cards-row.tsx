import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { DashboardStats } from '@/types/models';
import dashboardBg from '@/assets/images/dashboard.jpg';

interface StatCardsRowProps {
  stats: DashboardStats;
}

export function StatCardsRow({ stats }: StatCardsRowProps) {
  const { user } = useAuth();
  const firstName = user?.name ? user.name.split(' ')[0] : 'Traveler';

  const cards = [
    {
      label: 'Upcoming Trips',
      value: stats.upcomingTrips ?? 0,
      rotateClass: '-rotate-[12deg]',
      statRotateClass: 'rotate-[12deg]',
      translateClass: 'translate-y-[22px] md:translate-y-[42px]',
      zIndexClass: 'z-10',
      marginClass: '',
    },
    {
      label: 'Ongoing Trips',
      value: stats.ongoingTrips ?? 0,
      rotateClass: '-rotate-[8deg]',
      statRotateClass: 'rotate-[8deg]',
      translateClass: 'translate-y-[18px] md:translate-y-[38px]',
      zIndexClass: 'z-20',
      marginClass: '-ml-2 md:-ml-2 lg:-ml-3',
    },
    {
      label: 'Completed Trips',
      value: stats.completedTrips ?? 0,
      rotateClass: '-rotate-[5deg]',
      statRotateClass: 'rotate-[5deg]',
      translateClass: 'translate-y-[20px] md:translate-y-[40px]',
      zIndexClass: 'z-30',
      marginClass: '-ml-2 md:-ml-2 lg:-ml-3',
    },
    {
      label: 'Pending Invites',
      value: stats.pendingInvites ?? 0,
      rotateClass: '-rotate-[2deg]',
      statRotateClass: 'rotate-[2deg]',
      translateClass: 'translate-y-[23px] md:translate-y-[46px]',
      zIndexClass: 'z-40',
      marginClass: '-ml-2 md:-ml-2 lg:-ml-3',
    },
  ];

  return (
    <div
      className="relative w-full rounded-[22px] md:rounded-[30px] overflow-hidden bg-cover bg-center p-6 sm:p-8 md:p-10 lg:p-12 text-white flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12 min-h-[220px] md:min-h-[280px] shadow-lg shadow-neutral-200/50"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
      <div className="absolute inset-0 bg-black/15 z-0" />

      <div className="relative z-10 flex flex-col max-w-sm text-left mb-6 md:mb-0">
        <h2 className="text-[28px] md:text-5xl font-semibold tracking-tight text-white font-sans">
          Hi!, {firstName}
        </h2>
        <p className="text-sm sm:text-base text-white/90 font-normal mt-2 leading-relaxed">
          Welcome back. Here is your travel overview.
        </p>
      </div>

      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 lg:right-12 flex items-end gap-x-1 md:gap-x-3.5 pr-0 w-max z-10">
        {cards.map((card, idx) => {
          const labelParts = card.label.split(' ');
          return (
            <div
              key={idx}
              className={cn(
                'w-auto',
                card.rotateClass,
                card.translateClass,
                card.zIndexClass,
                card.marginClass,
              )}
            >
              <div className="w-[82px] sm:w-[90px] md:w-[135px] lg:w-[150px] h-[105px] sm:h-[115px] md:h-[155px] lg:h-[165px] rounded-t-[14px] md:rounded-t-[18px] rounded-b-none border border-white/10 bg-white/35 shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] flex flex-col justify-between p-2 md:p-4 pb-8 md:pb-14 text-left select-none">
                <div className="flex flex-col items-start leading-tight w-full">
                  <span className="text-[8px] sm:text-[9px] md:text-xs font-normal text-white">
                    {labelParts[0]}
                  </span>
                  <span className="text-[8px] sm:text-[9px] md:text-xs font-normal text-white">
                    {labelParts[1]}
                  </span>
                </div>

                <div className={cn('w-full flex justify-center mt-auto', card.statRotateClass)}>
                  <span className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-light tracking-tight text-white">
                    {card.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
