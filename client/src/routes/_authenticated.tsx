/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Outlet, useRouter, useLocation } from '@tanstack/react-router';
import { TopNavbar } from '@/components/shared/top-navbar';
import { useAuth } from '@/hooks/use-auth';
import { SocketProvider } from '@/components/providers/socket-provider';
import { useEffect } from 'react';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isPending, user } = useAuth();
  const router = useRouter();
  const location = useLocation();

  useEffect(() => {
    if (!isPending && !user) {
      router.navigate({ to: '/sign-in' });
    }
  }, [isPending, user, router]);

  if (isPending) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  const isSettingsPage = location.pathname === '/settings';
  const isTripWorkspace = location.pathname.startsWith('/trips/');

  return (
    <SocketProvider>
      <div className="flex min-h-screen flex-col bg-background">
        {!isSettingsPage && !isTripWorkspace && <TopNavbar />}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </SocketProvider>
  );
}
