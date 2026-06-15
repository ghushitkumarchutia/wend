import { Link } from '@tanstack/react-router';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useState } from 'react';

export function LandingNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-lg font-bold tracking-tight">
          Wend
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            to="/explore"
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore
          </Link>
          <Link to="/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/sign-up">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>

        <Button variant="ghost" size="icon-sm" className="md:hidden" onClick={() => setOpen(true)}>
          <Menu className="size-5" />
        </Button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-64">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold">Wend</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-2 px-2">
            <Link
              to="/explore"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Explore
            </Link>
            <Link
              to="/sign-in"
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              Sign In
            </Link>
            <Link to="/sign-up" onClick={() => setOpen(false)}>
              <Button size="sm" className="w-full">
                Get Started
              </Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
