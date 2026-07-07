/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router';
import { TopNavbar } from '@/components/shared/top-navbar';
import { useAuth } from '@/hooks/use-auth';
import { useEffect } from 'react';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isPending, user } = useAuth();
  const router = useRouter();

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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
