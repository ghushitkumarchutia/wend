import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail } from 'lucide-react';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    // @ts-expect-error better-auth plugin types not inferred
    const { error: resetError } = await authClient.forgetPassword({
      email,
      redirectTo: '/reset-password',
    });

    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-[320px] sm:max-w-[400px] bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-neutral-100/50 p-0 text-left overflow-hidden">
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px white inset !important;
          -webkit-text-fill-color: #171717 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
      <CardHeader className="p-6 pb-4 text-center">
        <CardDescription className="text-base md:text-lg font-bold text-neutral-800 tracking-tight">
          Forgot Password
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-0">
        {success ? (
          <div className="flex flex-col gap-4 text-center">
            <Alert className="border-emerald-100 bg-emerald-50/50 py-3 text-left rounded-xl">
              <AlertDescription className="text-xs text-emerald-800 leading-normal">
                If an account exists with that email, a password reset link has been sent.
              </AlertDescription>
            </Alert>
            <Link to="/sign-in" className="w-full">
              <Button
                variant="outline"
                className="w-full h-10 md:h-11 rounded-xl font-medium border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 transition-all duration-200 cursor-pointer"
              >
                Back to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-xs sm:text-sm text-neutral-500 font-light leading-relaxed text-center max-w-[280px] mx-auto pb-2">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-neutral-600"
              >
                Email Address
              </Label>
              <div className="relative flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden focus-within:border-[#09a474] focus-within:hover:border-[#09a474] hover:border-neutral-300 transition-all duration-200">
                <Mail className="absolute left-3.5 h-4.5 w-4.5 text-neutral-400 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 md:h-11 pl-10 pr-4 py-2 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none outline-none focus:outline-none w-full text-sm"
                />
              </div>
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="rounded-xl border-red-100 bg-red-50/50 py-3 text-left"
              >
                <AlertDescription className="text-xs text-red-700 leading-normal">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-10 md:h-11 mt-2 inline-flex items-center justify-center rounded-xl bg-[#09a474] hover:bg-[#088f65] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-700/10 cursor-pointer border-none outline-none focus-visible:ring-2 focus-visible:ring-[#09a474]/55 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Sending link...' : 'Send reset link'}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="p-6">
        <div className="w-full text-center text-sm text-neutral-500 font-light leading-relaxed">
          Remember your password?{' '}
          <Link
            to="/sign-in"
            className="font-medium text-[#09a474] hover:text-[#088f65] hover:underline underline-offset-4 decoration-[#09a474]/30 hover:decoration-[#09a474] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
