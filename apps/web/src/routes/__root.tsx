import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { TopNavbar } from '@/components/shared/top-navbar';

interface RouterContext {
  queryClient: QueryClient;
}

const PUBLIC_ROUTES = [
  '/',
  '/sign-up',
  '/sign-in',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/terms',
  '/privacy',
];

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/explore');
  const showNavbar =
    !isPublic &&
    !pathname.startsWith('/sign-') &&
    pathname !== '/forgot-password' &&
    pathname !== '/reset-password' &&
    pathname !== '/verify-email';

  return (
    <TooltipProvider>
      {showNavbar && <TopNavbar />}
      <Outlet />
    </TooltipProvider>
  );
}
