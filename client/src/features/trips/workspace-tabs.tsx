import { Link, useLocation } from '@tanstack/react-router';
import { cn } from '@/lib/utils';
import type { TripMemberRole } from '@/types/models';

interface WorkspaceTabsProps {
  tripId: string;
  role: TripMemberRole;
}

export function WorkspaceTabs({ tripId }: WorkspaceTabsProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const tabs = [
    { name: 'Itinerary', href: `/trips/${tripId}` },
    { name: 'Ledger', href: `/trips/${tripId}/ledger` },
    { name: 'Documents', href: `/trips/${tripId}/documents` },
    { name: 'Travelers', href: `/trips/${tripId}/travelers` },
  ];

  return (
    <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 pt-1 w-full">
      <nav className="px-4 sm:px-6 md:px-8 -mb-px flex space-x-8 sm:space-x-10 overflow-x-auto select-none" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href ||
            (pathname.startsWith(tab.href) && tab.href !== `/trips/${tripId}`);

          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                isActive
                  ? 'border-[#09a474] text-[#09a474] font-semibold'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 font-medium',
                'whitespace-nowrap border-b-2 py-3 px-1 text-sm sm:text-base transition-colors duration-200 cursor-pointer flex items-center justify-center'
              )}
            >
              {tab.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
