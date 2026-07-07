/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router';
import { SignUpForm } from '@/features/auth/sign-up-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@tanstack/react-router';
import { useEffect } from 'react';

export const Route = createFileRoute('/sign-up')({
  component: SignUpRoute,
});

function SignUpRoute() {
  const { user, isPending } = useAuth();
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
      <SignUpForm />
    </div>
  );
}
