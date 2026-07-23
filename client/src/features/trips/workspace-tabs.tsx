import { Link, useLocation } from '@tanstack/react-router';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Calendar02Icon,
  Wallet05Icon,
  File02Icon,
  UserMultipleIcon,
} from '@hugeicons/core-free-icons';
import type { TripMemberRole } from '@/types/models';

interface WorkspaceTabsProps {
  tripId: string;
  role: TripMemberRole;
}

export function WorkspaceTabs({ tripId }: WorkspaceTabsProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const tabs = [
    { name: 'Itinerary', href: `/trips/${tripId}`, icon: Calendar02Icon },
    { name: 'Ledger', href: `/trips/${tripId}/ledger`, icon: Wallet05Icon },
    { name: 'Documents', href: `/trips/${tripId}/documents`, icon: File02Icon },
    { name: 'Travelers', href: `/trips/${tripId}/travelers`, icon: UserMultipleIcon },
  ];

  return (
    <div className="sticky top-0 z-30 py-2.5 sm:py-3 px-2 sm:px-6 md:px-8 w-full select-none flex items-center justify-start bg-transparent font-manrope">
      <nav
        className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-full bg-white border border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-full overflow-x-auto no-scrollbar"
        aria-label="Tabs"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            pathname === tab.href ||
            (pathname.startsWith(tab.href) && tab.href !== `/trips/${tripId}`);

          if (isActive) {
            return (
              <Link
                key={tab.name}
                to={tab.href}
                className="relative flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-white font-semibold text-[11px] sm:text-sm cursor-pointer select-none shrink-0 group focus:outline-none transition-all duration-200 active:scale-[0.97]"
                style={{
                  background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                  boxShadow: `
                    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                    inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
                    0 6px 16px -2px rgba(16, 185, 129, 0.45),
                    0 3px 6px 0 rgba(0, 0, 0, 0.12)
                  `,
                }}
              >
                <div className="absolute inset-x-2 sm:inset-x-3 top-0.5 h-1 sm:h-1.5 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white flex items-center justify-center shrink-0 relative z-10 -translate-y-px"
                  style={{
                    boxShadow: `
                      inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                      inset 0 1px 2px rgba(255, 255, 255, 1),
                      0 2px 4px rgba(0, 0, 0, 0.15)
                    `,
                  }}
                >
                  <HugeiconsIcon
                    icon={Icon}
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 block"
                    color="#10b981"
                    strokeWidth={2.2}
                  />
                </div>

                <span className="relative z-10 leading-none tracking-wide drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] whitespace-nowrap -translate-y-px">
                  {tab.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.name}
              to={tab.href}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/80 font-medium text-[11px] sm:text-sm transition-all duration-150 cursor-pointer shrink-0 group"
            >
              <HugeiconsIcon
                icon={Icon}
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 block text-neutral-400 group-hover:text-neutral-700 transition-colors shrink-0"
                strokeWidth={1.8}
              />
              <span className="leading-none whitespace-nowrap tracking-wide -translate-y-px">{tab.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
