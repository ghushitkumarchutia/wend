/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Navigate } from '@tanstack/react-router';
import { AdminLoginForm } from '@/components/shared/admin-login-form';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export const Route = createFileRoute('/login')({
  component: LoginPage,
});

function LoginPage() {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/templates" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Wend Admin</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your templates</p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
