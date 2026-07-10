/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, useSearch } from '@tanstack/react-router';
import { VerifyEmailStatus } from '@/features/auth/verify-email-status';

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || undefined,
    };
  },
  component: VerifyEmailRoute,
});

function VerifyEmailRoute() {
  const { token } = useSearch({ from: '/verify-email' });

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <VerifyEmailStatus token={token || null} />
    </div>
  );
}
