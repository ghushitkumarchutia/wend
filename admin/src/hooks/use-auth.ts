import { authClient } from '@/lib/auth-client';

interface AdminSession {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  };
}

export function useAuth() {
  const { data: session, isPending, error } = authClient.useSession();

  const isAdmin = (session?.user as AdminSession['user'] | undefined)?.role === 'admin';

  return {
    session: session as AdminSession | null,
    isPending,
    error,
    isAdmin,
    isAuthenticated: !!session && isAdmin,
  };
}
