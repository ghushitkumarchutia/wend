import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { TripWithRole } from '@/types/models';
import { MapPin, Calendar, ArrowLeft, MoreVertical, Pencil, Archive, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

  const startDate = new Date(trip.startDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endDate = new Date(trip.endDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const defaultCover =
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2560&q=95';
  const coverUrl = trip.coverImageUrl || defaultCover;

  return (
    <div className="relative w-full shrink-0 aspect-16/8 sm:aspect-21/8 md:aspect-24/8 min-h-[280px] max-h-[520px] overflow-hidden select-none bg-neutral-900">
      <img
        src={coverUrl}
        alt={trip.name}
        className="w-full h-full object-cover object-center text-transparent transition-all duration-300"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black/85" />
      <div className="absolute top-4 left-4 right-4 sm:top-6 sm:left-6 sm:right-6 flex items-center justify-between z-20">
        <Link
          to="/dashboard"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center cursor-pointer shadow-sm"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 text-white stroke-[2.5]" />
        </Link>

        {isOrganizer && (
          <DropdownMenu>
            <DropdownMenuTrigger className="w-10 h-10 sm:w-11 sm:h-11 rounded-full text-white flex items-center justify-center cursor-pointer focus-visible:outline-none">
              <MoreVertical className="w-5 h-5 text-white stroke-[2.5]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-52 bg-white/20 backdrop-blur-md border border-white/10 rounded-xl shadow-xl p-1.5 z-50 flex flex-col gap-y-0.5 text-white"
              align="end"
              autoFocus={false}
            >
              <DropdownMenuItem
                onClick={() => setIsEditModalOpen(true)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white bg-transparent! focus:bg-white/20! focus:text-white! hover:bg-white/20! hover:text-white! cursor-pointer transition-all duration-200 flex items-center"
              >
                <Pencil className="mr-2.5 h-4 w-4 text-white shrink-0" />
                <span className="text-white">Edit Trip Details</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsArchiveDialogOpen(true)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-white bg-transparent! focus:bg-white/20! focus:text-white! hover:bg-white/20! hover:text-white! cursor-pointer transition-all duration-200 flex items-center"
              >
                <Archive className="mr-2.5 h-4 w-4 text-white shrink-0" />
                <span className="text-white">Archive Trip</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setIsDeleteDialogOpen(true)}
                variant="destructive"
                className="group rounded-lg px-3 py-2 text-sm font-medium text-red-500 bg-transparent! focus:bg-red-500! focus:text-white! hover:bg-red-500! hover:text-white! cursor-pointer transition-all duration-200 flex items-center mt-0.5"
              >
                <Trash2 className="mr-2.5 h-4 w-4 text-red-500! group-hover:text-white! focus:text-white! shrink-0 transition-colors" />
                <span className="text-red-500 group-hover:text-white transition-colors">
                  Delete Trip
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="absolute bottom-6 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8 z-10 flex flex-col items-start gap-2 sm:gap-3">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold tracking-normal text-white drop-shadow-md leading-tight">
          {trip.name}
        </h1>

        <div className="inline-flex flex-wrap items-center gap-2 sm:gap-3 px-3.5 py-1.5 sm:px-4 sm:py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white text-xs sm:text-sm font-light shadow-sm">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-white/90 shrink-0" />
            <span>{trip.destination}</span>
          </span>
          <span className="text-white/40 font-light select-none">|</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-white/90 shrink-0" />
            <span>
              {startDate} - {endDate}
            </span>
          </span>
        </div>
      </div>

      {isOrganizer && (
        <>
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
  );
}
