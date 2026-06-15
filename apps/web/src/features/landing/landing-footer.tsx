import { Link } from '@tanstack/react-router';
import { Separator } from '@/components/ui/separator';

export function LandingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold">Wend</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-xs text-muted-foreground">
            © {year} Wend. All rights reserved.
          </span>
        </div>
        <nav className="flex items-center gap-4 text-xs text-muted-foreground">
          <Link to="/terms" className="transition-colors hover:text-foreground">
            Terms of Service
          </Link>
          <Link to="/privacy" className="transition-colors hover:text-foreground">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
