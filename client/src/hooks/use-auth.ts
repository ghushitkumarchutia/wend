import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from '@tanstack/react-router';
import { useCallback } from 'react';

export function useAuth() {
  const session = useSession();
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({ to: '/sign-in' });
        },
      },
    });
  }, [router]);

  return {
    session: session.data?.session ?? null,
    user: session.data?.user ?? null,
    isPending: session.isPending,
    error: session.error,
    signOut: handleSignOut,
  };
}
