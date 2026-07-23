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
      className="relative w-full rounded-[22px] md:rounded-[30px] overflow-hidden bg-cover bg-center p-6 md:p-10 lg:p-12 text-white flex flex-col md:flex-row md:items-start justify-between gap-8 md:gap-12 min-h-57.5 md:min-h-70 shadow-lg shadow-neutral-200/50"
      style={{ backgroundImage: `url(${dashboardBg})` }}
    >
      <div className="absolute inset-0 bg-black/20 z-0" />

      <div className="relative z-10 flex flex-col max-w-sm text-left mb-6 md:mb-0">
        <h2 className="text-[28px] md:text-5xl font-bold tracking-tight text-white font-syne">
          Hi, {firstName}!
        </h2>
        <p className="text-xs md:text-sm lg:text-base text-white/90 font-manrope font-medium mt-1.5 leading-relaxed">
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
              <div className="w-20.5 md:w-28 lg:w-33.75 xl:w-37.5 h-27 md:h-34 lg:h-38.75 xl:h-41.25 rounded-t-[14px] md:rounded-t-[18px] rounded-b-none border border-white/20 bg-white/15 backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] flex flex-col justify-between p-2.5 md:p-4 pb-8 md:pb-14 text-left select-none font-manrope">
                <div className="flex flex-col items-start leading-tight w-full font-manrope">
                  <span className="text-[8px] md:text-[9px] lg:text-xs font-medium text-white/90 tracking-wide">
                    {labelParts[0]}
                  </span>
                  <span className="text-[8px] md:text-[9px] lg:text-xs font-medium text-white/90 tracking-wide">
                    {labelParts[1]}
                  </span>
                </div>

                <div className={cn('w-full flex justify-center mt-auto', card.statRotateClass)}>
                  <span className="text-xl md:text-3xl lg:text-4xl xl:text-5xl font-light tracking-tight text-white font-syne">
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
