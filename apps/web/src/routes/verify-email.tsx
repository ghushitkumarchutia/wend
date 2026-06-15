import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { authClient } from '@/lib/auth-client';

export const Route = createFileRoute('/verify-email')({
  validateSearch: (search: Record<string, unknown>): { token?: string } => ({
    token: typeof search.token === 'string' ? search.token : undefined,
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    authClient
      .verifyEmail({ query: { token } })
      .then((result) => {
        if (result.error) {
          setStatus('error');
        } else {
          setStatus('success');
        }
      })
      .catch(() => {
        setStatus('error');
      });
  }, [token]);

  async function handleResend() {
    setResending(true);
    try {
      const session = await authClient.getSession();
      if (session.data?.user?.email) {
        await authClient.sendVerificationEmail({
          email: session.data.user.email,
        });
      }
    } finally {
      setResending(false);
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Verifying your email…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center text-center">
            <h1 className="text-xl font-bold">Email verified!</h1>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground">
              Your email is verified. You can now sign in to Wend.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to="/sign-in">
              <Button>Sign in</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <h1 className="text-xl font-bold">Verification failed</h1>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            This verification link has already been used or has expired.
          </p>
          <Button variant="outline" size="sm" onClick={handleResend} disabled={resending}>
            {resending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Request a new verification email
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <Link to="/sign-in" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
