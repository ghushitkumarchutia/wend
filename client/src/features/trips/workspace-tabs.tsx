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
    <div className="border-b">
      <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href || (pathname.startsWith(tab.href) && tab.href !== `/trips/${tripId}`);
          
          return (
            <Link
              key={tab.name}
              to={tab.href}
              className={cn(
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground',
                'whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors'
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
