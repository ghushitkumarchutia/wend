import { Link, useRouter } from '@tanstack/react-router';
import { Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '@/components/shared/notification-bell';
import { UserAvatarMenu } from '@/components/shared/user-avatar-menu';
import { MobileNavDrawer } from '@/components/shared/mobile-nav-drawer';
import { useState } from 'react';

export function TopNavbar({ onCreateTrip }: { onCreateTrip?: () => void }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = router.state.location.pathname;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard" className="mr-2 text-lg font-bold tracking-tight">
          Wend
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/dashboard"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Trips
          </Link>
          <Link
            to="/explore"
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${pathname.startsWith('/explore') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Explore
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {onCreateTrip && (
            <Button size="sm" onClick={onCreateTrip} className="hidden sm:inline-flex">
              <Plus className="size-4" />
              New Trip
            </Button>
          )}
          {onCreateTrip && (
            <Button size="icon-sm" onClick={onCreateTrip} className="sm:hidden">
              <Plus className="size-4" />
            </Button>
          )}
          <NotificationBell />
          <UserAvatarMenu />
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>
      <MobileNavDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
    </header>
  );
}
