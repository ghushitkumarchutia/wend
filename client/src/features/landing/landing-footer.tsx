import { Link } from '@tanstack/react-router';

export function LandingFooter() {
  return (
    <footer className="w-full py-6 border-t bg-background">
      <div className="container px-4 md:px-6 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Wend. All rights reserved.
        </p>
        <nav className="flex gap-4">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            Privacy Policy
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:underline">
            Terms of Service
          </Link>
        </nav>
      </div>
    </footer>
  );
}
