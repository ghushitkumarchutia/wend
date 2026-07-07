/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { ResetPasswordForm } from '@/features/auth/reset-password-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';
import { z } from 'zod';

export const Route = createFileRoute('/reset-password')({
  validateSearch: z.object({
    token: z.string().optional(),
  }),
  component: ResetPasswordRoute,
});

function ResetPasswordRoute() {
  const { user, isPending } = useAuth();
  const { token } = useSearch({ from: '/reset-password' });
  const router = useRouter();

  useEffect(() => {
    if (!isPending && user) {
      router.navigate({ to: '/dashboard' });
    }
  }, [user, isPending, router]);

  if (isPending || user) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <ResetPasswordForm token={token || null} />
    </div>
  );
}
