import { createFileRoute } from '@tanstack/react-router';
import { SignInForm } from '@/features/auth/sign-in-form';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/sign-in')({
  component: SignInRoute,
});

function SignInRoute() {
  const { user, isPending } = useAuth();
  const router = useRouter();
  const [initialLoadComplete, setInitialLoadComplete] = useState(!isPending);

  if (!isPending && !initialLoadComplete) {
    setInitialLoadComplete(true);
  }

  useEffect(() => {
    if (!isPending && user) {
      router.navigate({ to: '/dashboard' });
    }
  }, [user, isPending, router]);

  if (isPending && !initialLoadComplete) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <SignInForm />
    </div>
  );
}
