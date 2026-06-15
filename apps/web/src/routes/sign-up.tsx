import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { authClient } from '@/lib/auth-client';
import { MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH } from '@wend/shared';
import { GoogleButton } from '@/features/auth/google-button';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(MAX_PASSWORD_LENGTH),
});

type FormValues = z.infer<typeof formSchema>;

export const Route = createFileRoute('/sign-up')({
  component: SignUpPage,
});

function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
  });

  async function onSubmit(data: FormValues) {
    await authClient.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    setSubmittedEmail(data.email);
  }

  async function handleResend() {
    if (!submittedEmail || resending) return;
    setResending(true);
    try {
      await authClient.sendVerificationEmail({
        email: submittedEmail,
      });
    } finally {
      setResending(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="items-center space-y-1 text-center">
            <h1 className="text-xl font-bold">Check your email</h1>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              We've sent a verification link to{' '}
              <span className="font-medium text-foreground">{submittedEmail}</span>. Click the link
              in the email to activate your account.
            </p>
            <Button variant="outline" size="sm" onClick={handleResend} disabled={resending}>
              {resending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Resend email
            </Button>
          </CardContent>
          <CardFooter className="justify-center">
            <button
              type="button"
              onClick={() => setSubmittedEmail(null)}
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Wrong email? Go back
            </button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center space-y-1 text-center">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            Wend
          </Link>
          <p className="text-sm text-muted-foreground">Create your account</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleButton label="Continue with Google" />

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              Or sign up with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" placeholder="Your name" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 10 characters"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Create account
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/sign-in"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
