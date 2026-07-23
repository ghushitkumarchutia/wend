import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import type { TripWithRole } from '@/types/models';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowLeft02Icon,
  Location01Icon,
  Calendar02Icon,
  MoreVerticalIcon,
  PencilEdit02Icon,
  Delete01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons';
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
  const [isActionsRevealed, setIsActionsRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOrganizer = trip.role === 'organizer';
  const isActiveOrHovered = isActionsRevealed || isHovered;

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

  const rawCover = trip.coverImageUrl || defaultCover;
  const coverUrl = rawCover.includes('images.unsplash.com')
    ? rawCover.replace(/w=\d+/, 'w=2560').replace(/q=\d+/, 'q=95')
    : rawCover;

  return (
    <div className="relative w-full shrink-0 aspect-video md:aspect-18/7 lg:aspect-16/6 min-h-65 md:min-h-95 lg:min-h-110 max-h-150 overflow-hidden select-none bg-neutral-900 font-manrope">
      <img
        src={coverUrl}
        alt={trip.name}
        className="w-full h-full object-cover object-center text-transparent transition-all duration-300"
      />
      <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/20 to-black/85" />
      <div className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 flex items-center justify-between z-20">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 pl-0.5 pr-2 py-1.5 text-white hover:opacity-90 transition-all focus-visible:outline-none cursor-pointer drop-shadow-md group"
          title="Back to Dashboard"
        >
          <HugeiconsIcon
            icon={ArrowLeft02Icon}
            className="size-6 md:size-7 text-white shrink-0 group-hover:-translate-x-0.5 transition-transform"
            strokeWidth={2.25}
          />
          <span className="text-xs md:text-sm font-manrope font-medium text-white/95 tracking-wide drop-shadow-sm">
            Back to Dashboard
          </span>
        </Link>

        {isOrganizer && (
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative flex items-center h-7.5 md:h-9 rounded-full transition-all duration-300 ease-in-out select-none z-30 overflow-hidden shrink-0 cursor-pointer ${
              isActionsRevealed ? 'w-26 md:w-30.5' : 'w-7.5 md:w-9'
            }`}
            style={{
              background: isActiveOrHovered
                ? 'linear-gradient(145deg, #10b981 0%, #059669 100%)'
                : 'transparent',
              boxShadow: isActiveOrHovered
                ? `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25)
                `
                : 'none',
            }}
          >
            {isActiveOrHovered && (
              <div className="absolute inset-x-2 top-0.5 h-1 md:h-1.5 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none z-0" />
            )}

            <div
              className={`absolute inset-x-1 flex items-center justify-between transition-all duration-200 z-10 ${
                isActionsRevealed
                  ? 'opacity-100 delay-100 pointer-events-auto'
                  : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(true);
                    setIsActionsRevealed(false);
                  }}
                  className="w-5.5 h-5.5 md:w-6.5 md:h-6.5 rounded-full bg-white hover:bg-white/90 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
                  style={{
                    boxShadow: `
                      inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                      inset 0 1px 2px rgba(255, 255, 255, 1),
                      0 2px 4px rgba(0, 0, 0, 0.15)
                    `,
                  }}
                  title="Edit Trip Details"
                >
                  <HugeiconsIcon
                    icon={PencilEdit02Icon}
                    className="w-3 h-3 md:w-3.5 md:h-3.5 block"
                    color="#059669"
                    strokeWidth={2}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDeleteDialogOpen(true);
                    setIsActionsRevealed(false);
                  }}
                  className="w-5.5 h-5.5 md:w-6.5 md:h-6.5 rounded-full bg-white hover:bg-white/90 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
                  style={{
                    boxShadow: `
                      inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                      inset 0 1px 2px rgba(255, 255, 255, 1),
                      0 2px 4px rgba(0, 0, 0, 0.15)
                    `,
                  }}
                  title="Delete Trip"
                >
                  <HugeiconsIcon
                    icon={Delete01Icon}
                    className="w-3 h-3 md:w-3.5 md:h-3.5 block"
                    color="#e11d48"
                    strokeWidth={2}
                  />
                </button>
              </div>

              <div className="w-px h-3 md:h-3.5 bg-white/40 my-auto shrink-0 mx-auto" />

              <button
                type="button"
                onClick={() => setIsActionsRevealed(false)}
                className="w-5.5 h-5.5 md:w-6.5 md:h-6.5 rounded-full bg-white hover:bg-white/90 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0"
                style={{
                  boxShadow: `
                    inset 0 -1px 2px rgba(0, 0, 0, 0.15),
                    inset 0 1px 2px rgba(255, 255, 255, 1),
                    0 2px 4px rgba(0, 0, 0, 0.15)
                  `,
                }}
                title="Close Actions"
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  className="w-3 h-3 md:w-3.5 md:h-3.5 block"
                  color="#e11d48"
                  strokeWidth={2.2}
                />
              </button>
            </div>

            {!isActionsRevealed && (
              <button
                type="button"
                onClick={() => setIsActionsRevealed(true)}
                className="absolute inset-0 w-full h-full flex items-center justify-center cursor-pointer focus-visible:outline-none z-10"
                title="Trip Actions"
              >
                <HugeiconsIcon
                  icon={MoreVerticalIcon}
                  className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white block drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]"
                  strokeWidth={2.2}
                />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="absolute bottom-5 left-4 right-4 md:bottom-8 md:left-8 md:right-8 z-10 flex flex-col items-start gap-2 md:gap-3">
        <h1 className="font-syne text-3xl md:text-5xl lg:text-6xl font-bold tracking-normal text-white drop-shadow-md leading-tight">
          {trip.name}
        </h1>

        <div className="inline-flex flex-wrap items-center gap-1.5 md:gap-3 px-2.5 py-1 md:px-4 md:py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/10 text-white font-manrope text-[10.5px] md:text-sm shadow-sm">
          <span className="flex items-center gap-1 md:gap-1.5">
            <HugeiconsIcon
              icon={Location01Icon}
              className="size-3 md:size-4 text-white/90 shrink-0"
              strokeWidth={1.75}
            />
            <span>{trip.destination}</span>
          </span>
          <span className="text-white/40 font-light select-none text-[10px] md:text-xs">|</span>
          <span className="flex items-center gap-1 md:gap-1.5">
            <HugeiconsIcon
              icon={Calendar02Icon}
              className="size-3 md:size-4 text-white/90 shrink-0"
              strokeWidth={1.75}
            />
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
