import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/sign-in')({
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => {
    return {
      redirect: typeof search.redirect === 'string' ? search.redirect : undefined,
    };
  },
  component: SignInPage,
});

function SignInPage() {
  return <div>Sign In</div>;
}
