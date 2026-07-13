import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings } from 'lucide-react';
import { NotificationBell } from '@/features/notifications/notification-bell';

export function TopNavbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-4 md:gap-6 h-full">
          <nav className="flex gap-4 sm:gap-8 h-full">
            <Link
              to="/dashboard"
              className="text-sm font-semibold text-neutral-600 transition-all duration-200 hover:text-neutral-900 border-b-2 border-transparent hover:border-neutral-300 h-full flex items-center px-1 [&.active]:text-[#09a474] [&.active]:border-[#09a474]"
            >
              Dashboard
            </Link>
            <Link
              to="/explore"
              className="text-sm font-semibold text-neutral-600 transition-all duration-200 hover:text-neutral-900 border-b-2 border-transparent hover:border-neutral-300 h-full flex items-center px-1 [&.active]:text-[#09a474] [&.active]:border-[#09a474]"
            >
              Explore
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger
              className={buttonVariants({
                variant: 'ghost',
                className: 'relative h-8 w-8 rounded-full cursor-pointer',
              })}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 bg-white/85 backdrop-blur-md border border-neutral-200/50 rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-y-0.5"
              align="end"
              autoFocus={false}
            >
              <DropdownMenuItem className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neutral-700 bg-transparent! focus:bg-transparent! focus:text-neutral-700! hover:bg-[#09a474]/10! hover:text-[#09a474]! focus:hover:bg-[#09a474]/10! focus:hover:text-[#09a474]! cursor-pointer transition-all duration-200 flex items-center">
                <Link to="/settings" className="flex flex-1 items-center">
                  <Settings className="mr-2.5 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={signOut}
                variant="destructive"
                className="rounded-lg px-3 py-2.5 text-sm font-semibold bg-red-500! hover:bg-red-600! focus:bg-red-600! text-white! hover:text-white! focus:text-white! cursor-pointer transition-all duration-200 flex items-center mt-1"
              >
                <LogOut className="mr-2.5 h-4 w-4 text-white!" />
                <span className="text-white!">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
