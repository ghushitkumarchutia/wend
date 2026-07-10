import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export function VerifyEmailStatus({ token }: { token: string | null }) {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useState(token ? '' : 'Verification token is missing.');

  useEffect(() => {
    if (!token) return;

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
    <Card className="w-full max-w-[320px] sm:max-w-[400px] bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-neutral-100/50 p-0 text-left overflow-hidden mx-auto">
      <CardHeader className="p-6 pb-4 text-center">
        <CardTitle className="text-xl md:text-2xl font-black tracking-tight text-neutral-950 mb-1.5 font-sans">
          Wend.com
        </CardTitle>
        <CardDescription className="text-base md:text-lg font-bold text-neutral-800 tracking-tight">
          {status === 'loading' && 'Verifying Email...'}
          {status === 'success' && 'Email Verified'}
          {status === 'error' && 'Verification Failed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-6 flex flex-col items-center justify-center">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center text-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#09a474] mb-4" />
            <p className="text-sm text-neutral-600 font-medium">Please wait while we verify your link.</p>
          </div>
        )}
        {status === 'success' && (
          <div className="flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="h-14 w-14 text-[#09a474] mb-4" />
            <p className="text-sm text-neutral-600 font-medium">Your email address has been successfully verified!</p>
          </div>
        )}
        {status === 'error' && (
          <div className="flex flex-col items-center text-center w-full">
            <XCircle className="mb-4 h-14 w-14 text-red-500" />
            <div className="rounded-xl border border-red-100 bg-red-50/50 py-3 px-4 text-left w-full">
              <p className="text-xs text-red-700 leading-normal font-semibold text-center">{errorMessage}</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0 bg-neutral-50/50 flex flex-col justify-center border-t border-neutral-100/60 mt-4">
        {status !== 'loading' ? (
          <Link
            to={status === 'success' ? '/dashboard' : '/sign-in'}
            className="w-full h-10 md:h-11 inline-flex items-center justify-center rounded-xl bg-[#09a474] hover:bg-[#088f65] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-700/10 cursor-pointer border-none outline-none focus-visible:ring-2 focus-visible:ring-[#09a474]/55 mt-2"
          >
            Continue to {status === 'success' ? 'Dashboard' : 'Sign In'}
          </Link>
        ) : (
          <div className="w-full text-center text-sm text-neutral-500 font-light leading-relaxed mt-2">
            Verifying your account securely...
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
