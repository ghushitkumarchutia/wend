/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Outlet, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AdminNavbar } from '@/components/shared/admin-navbar';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AdminNavbar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
