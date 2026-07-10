import { useState } from 'react';
import { authClient } from '@/lib/auth-client';
import { useRouter, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Eye, EyeOff } from 'lucide-react';

export function ResetPasswordForm({ token }: { token: string | null }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    const { error: resetError } = await authClient.resetPassword({
      newPassword: password,
      token: token || '',
    });

    if (resetError) {
      setError(resetError.message || 'An error occurred while resetting the password.');
    } else {
      router.navigate({ to: '/sign-in' });
    }
    setLoading(false);
  };

  if (!token) {
    return (
      <Card className="w-full max-w-[320px] sm:max-w-[400px] bg-white border border-neutral-100 rounded-2xl shadow-xl shadow-neutral-100/50 p-0 text-left overflow-hidden mx-auto">
        <CardHeader className="p-6 pb-4 text-center">
          <CardDescription className="text-base md:text-lg font-bold text-neutral-800 tracking-tight">
            Reset Password
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 py-0 pb-6">
          <Alert
            variant="destructive"
            className="border-red-100 bg-red-50/50 py-3 text-left rounded-xl"
          >
            <AlertDescription className="text-xs text-red-700 leading-normal font-semibold">
              Invalid or missing token. Please check your email link or request a new password
              reset.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="p-6 pt-0 bg-neutral-50/50 flex flex-col justify-center border-t border-neutral-100/60 mt-4">
          <div className="w-full text-center text-sm text-neutral-500 font-light leading-relaxed mt-2">
            <Link
              to="/forgot-password"
              className="font-medium text-[#09a474] hover:text-[#088f65] hover:underline underline-offset-4 decoration-[#09a474]/30 hover:decoration-[#09a474] transition-colors"
            >
              Request a new link
            </Link>
          </div>
        </CardFooter>
      </Card>
    );
  }

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
          Reset Password
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 py-0">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="password"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-600"
            >
              New Password
            </Label>
            <div className="relative flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden focus-within:border-[#09a474] focus-within:hover:border-[#09a474] hover:border-neutral-300 transition-all duration-200">
              <Lock className="absolute left-3.5 h-4.5 w-4.5 text-neutral-400 pointer-events-none" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="************"
                required
                minLength={10}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 md:h-11 pl-10 pr-10 py-2 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none outline-none focus:outline-none w-full text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer outline-none focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-600"
            >
              Confirm Password
            </Label>
            <div className="relative flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden focus-within:border-[#09a474] focus-within:hover:border-[#09a474] hover:border-neutral-300 transition-all duration-200">
              <Lock className="absolute left-3.5 h-4.5 w-4.5 text-neutral-400 pointer-events-none" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="************"
                required
                minLength={10}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 md:h-11 pl-10 pr-10 py-2 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none outline-none focus:outline-none w-full text-sm"
              />
            </div>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="rounded-xl border-red-100 bg-red-50/50 py-3 text-left mt-1"
            >
              <AlertDescription className="text-xs text-red-700 leading-normal font-semibold">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full h-10 md:h-11 mt-1 mb-2 inline-flex items-center justify-center rounded-xl bg-[#09a474] hover:bg-[#088f65] active:scale-[0.99] text-white font-semibold text-sm transition-all duration-200 shadow-md shadow-emerald-700/10 cursor-pointer border-none outline-none focus-visible:ring-2 focus-visible:ring-[#09a474]/55 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="p-6 pt-0 bg-neutral-50/50 flex flex-col justify-center border-t border-neutral-100/60 mt-4">
        <div className="w-full text-center text-sm text-neutral-500 font-light leading-relaxed mt-2">
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
