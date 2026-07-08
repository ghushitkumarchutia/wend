import { useState } from 'react';
import type { TripWithRole } from '@/types/models';
import { MapPin, Calendar, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditTripModal } from './edit-trip-modal';
import { DeleteTripDialog } from './delete-trip-dialog';
import { ArchiveTripDialog } from './archive-trip-dialog';

interface WorkspaceHeaderProps {
  trip: TripWithRole;
}

export function WorkspaceHeader({ trip }: WorkspaceHeaderProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const isOrganizer = trip.role === 'organizer';

  const startDate = new Date(trip.startDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  const endDate = new Date(trip.endDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative w-full border-b bg-background">
      {trip.coverImageUrl && (
        <div className="absolute inset-0 z-0 h-32 w-full overflow-hidden opacity-20">
          <img src={trip.coverImageUrl} alt="Trip cover" className="h-full w-full object-cover" />
        </div>
      )}

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6 lg:px-8">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{trip.name}</h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {trip.destination}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {startDate} — {endDate}
            </span>
          </div>
        </div>

        {isOrganizer && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3">
                <Settings className="mr-2 h-4 w-4" />
                Trip Settings
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => setIsEditModalOpen(true)}>
                  Edit Trip Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setIsArchiveDialogOpen(true)}>
                  Archive Trip
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => setIsDeleteDialogOpen(true)}
                >
                  Delete Trip
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <EditTripModal trip={trip} open={isEditModalOpen} onOpenChange={setIsEditModalOpen} />
            <ArchiveTripDialog
              tripId={trip.id}
              open={isArchiveDialogOpen}
              onOpenChange={setIsArchiveDialogOpen}
            />
            <DeleteTripDialog
              tripId={trip.id}
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            />
          </>
        )}
      </div>
    </div>
  );
}
