import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';

export function LandingNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-extrabold text-xl tracking-tight">Wend</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/explore" className="text-sm font-medium hover:text-primary transition-colors">
            Explore
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <Link to="/sign-in" className={buttonVariants({ variant: 'ghost' })}>
            Log in
          </Link>
          <Link to="/sign-up" className={buttonVariants()}>
            Sign up
          </Link>
        </nav>
      </div>
    </header>
  );
}
