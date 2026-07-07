import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailStatus({ token }: { token: string | null }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'Verification token is missing.');

  useEffect(() => {
    if (!token) {
      return;
    }

    const verify = async () => {
      const { error } = await authClient.verifyEmail({
        query: { token },
      });

      if (error) {
        setStatus('error');
        setErrorMessage(error.message || 'An unknown error occurred.');
      } else {
        setStatus('success');
      }
    };

    verify();
  }, [token]);

  return (
    <Card className="mx-auto w-full max-w-sm text-center">
      <CardHeader>
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          {status === 'loading' && 'Verifying your email address...'}
          {status === 'success' && 'Your email has been verified!'}
          {status === 'error' && 'Verification failed.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-6">
        {status === 'loading' && <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />}
        {status === 'success' && <CheckCircle2 className="h-12 w-12 text-green-500" />}
        {status === 'error' && (
          <div className="flex flex-col items-center text-destructive">
            <XCircle className="mb-2 h-12 w-12" />
            <p className="text-sm">{errorMessage}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        {status !== 'loading' && (
          <Link to={status === 'success' ? '/dashboard' : '/sign-in'} className={buttonVariants()}>
            Continue
          </Link>
        )}
      </CardFooter>
    </Card>
  );
}
