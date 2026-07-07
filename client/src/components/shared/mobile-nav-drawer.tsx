import { Link } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import { buttonVariants } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useState } from 'react';

export function MobileNavDrawer() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "md:hidden" })}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle Menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="text-left font-bold">Wend</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col space-y-4 py-4">
          <Link
            to="/dashboard"
            onClick={() => setOpen(false)}
            className="text-lg font-medium transition-colors hover:text-primary"
          >
            Dashboard
          </Link>
          <Link
            to="/explore"
            onClick={() => setOpen(false)}
            className="text-lg font-medium transition-colors hover:text-primary"
          >
            Explore
          </Link>
          {user && (
            <Link
              to="/settings"
              onClick={() => setOpen(false)}
              className="text-lg font-medium transition-colors hover:text-primary"
            >
              Settings
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
