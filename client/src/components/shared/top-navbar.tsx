import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { formatImageUrl } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, LogoutSquare01Icon } from '@hugeicons/core-free-icons';
import { NotificationBell } from '@/features/notifications/notification-bell';

export function TopNavbar() {
  const { user, signOut } = useAuth();
  const avatarSrc = formatImageUrl(user?.image);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white">
      <div className="w-full flex h-14 items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-4 md:gap-6 h-full">
          <nav className="flex gap-4 sm:gap-8 h-full">
            <Link
              to="/dashboard"
              className="relative h-full flex items-center px-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.75 after:rounded-t-[3px] after:transition-colors after:duration-200 after:bg-transparent hover:after:bg-neutral-300 [&.active]:after:bg-emerald-500 group"
            >
              <div className="grid place-items-center">
                <span className="col-start-1 row-start-1 text-sm font-semibold font-syne text-neutral-600 transition-all duration-200 group-hover:text-neutral-900 group-[.active]:text-emerald-600 group-[.active]:text-[15px] group-[.active]:font-bold group-[.active]:tracking-wide">
                  Dashboard
                </span>
                <span
                  className="col-start-1 row-start-1 text-[15px] font-syne font-bold tracking-wide invisible pointer-events-none select-none"
                  aria-hidden="true"
                >
                  Dashboard
                </span>
              </div>
            </Link>
            <Link
              to="/explore"
              className="relative h-full flex items-center px-1 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.75 after:rounded-t-[3px] after:transition-colors after:duration-200 after:bg-transparent hover:after:bg-neutral-300 [&.active]:after:bg-emerald-500 group"
            >
              <div className="grid place-items-center">
                <span className="col-start-1 row-start-1 text-sm font-semibold font-syne text-neutral-600 transition-all duration-200 group-hover:text-neutral-900 group-[.active]:text-emerald-600 group-[.active]:text-[15px] group-[.active]:font-bold group-[.active]:tracking-wide">
                  Explore
                </span>
                <span
                  className="col-start-1 row-start-1 text-[15px] font-syne font-bold tracking-wide invisible pointer-events-none select-none"
                  aria-hidden="true"
                >
                  Explore
                </span>
              </div>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger className="relative h-8 w-8 sm:h-9 sm:w-9 rounded-full cursor-pointer outline-none transition-opacity hover:opacity-80">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border border-neutral-200/50 shadow-sm">
                <AvatarImage src={avatarSrc} alt={user?.name || ''} />
                <AvatarFallback className="bg-emerald-50 text-emerald-700 font-syne font-bold text-xs sm:text-sm">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-[0_12px_40px_-12px_rgba(0,0,0,0.15)] p-2 z-50 flex flex-col font-manrope"
              align="end"
              sideOffset={10}
              autoFocus={false}
            >
              <div className="flex items-center gap-3 px-2.5 py-3 mb-1.5 border-b border-neutral-100">
                <Avatar className="h-10 w-10 border border-neutral-200/50 shadow-sm">
                  <AvatarImage src={avatarSrc} alt={user?.name || ''} />
                  <AvatarFallback className="bg-emerald-50 text-emerald-700 font-syne font-bold">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-bold text-neutral-900 truncate font-syne tracking-tight">
                    {user?.name || 'User'}
                  </span>
                  <span className="text-xs font-medium text-neutral-500 truncate">
                    {user?.email || 'user@example.com'}
                  </span>
                </div>
              </div>

              <DropdownMenuItem className="rounded-lg p-0 text-sm font-semibold text-neutral-700 bg-transparent! focus:bg-transparent! focus:text-neutral-700! hover:bg-emerald-50! hover:text-emerald-700! focus:hover:bg-emerald-50! focus:hover:text-emerald-700! cursor-pointer transition-colors duration-200">
                <Link to="/settings" className="flex w-full items-center px-3 py-2.5">
                  <HugeiconsIcon
                    icon={Settings01Icon}
                    className="mr-3 h-4.5 w-4.5"
                    strokeWidth={2.25}
                  />
                  <span>Account Settings</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={signOut}
                className="rounded-lg p-0 mt-0.5 text-sm font-semibold text-rose-600! bg-transparent! hover:bg-rose-50! focus:bg-rose-50! hover:text-rose-600! focus:text-rose-600! hover:**:text-rose-600! focus:**:text-rose-600! cursor-pointer transition-colors duration-200"
              >
                <div className="flex w-full items-center px-3 py-2.5">
                  <HugeiconsIcon
                    icon={LogoutSquare01Icon}
                    className="mr-3 h-4.5 w-4.5"
                    strokeWidth={2.25}
                  />
                  <span>Log out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
