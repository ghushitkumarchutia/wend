/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { authClient } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || (session.user as { role?: string })?.role !== 'admin') {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
