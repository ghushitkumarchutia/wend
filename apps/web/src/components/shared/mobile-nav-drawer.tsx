import { Link } from '@tanstack/react-router';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface MobileNavDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileNavDrawer({ open, onOpenChange }: MobileNavDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold">Wend</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 flex flex-col gap-2 px-2">
          <Link
            to="/dashboard"
            onClick={() => onOpenChange(false)}
            className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Trips
          </Link>
          <Link
            to="/explore"
            onClick={() => onOpenChange(false)}
            className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Explore
          </Link>
          <Link
            to="/settings"
            onClick={() => onOpenChange(false)}
            className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Settings
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
