/* eslint-disable react-refresh/only-export-components */
import { createLazyFileRoute, Outlet } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { tripApi } from '@/lib/api-client';
import { WorkspaceHeader } from '@/features/trips/workspace-header';
import { WorkspaceTabs } from '@/features/trips/workspace-tabs';
import { useSocket } from '@/components/providers/socket-provider';
import { useEffect, useState } from 'react';
import { CommunicationPanel } from '@/features/communication/communication-panel';
import { DotLottiePlayer } from '@dotlottie/react-player';
import loaderUrl from '@/assets/lottie/loader.lottie?url';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HugeiconsIcon } from '@hugeicons/react';
import { Chat01Icon } from '@hugeicons/core-free-icons';

export const Route = createLazyFileRoute('/_authenticated/trips/$tripId')({
  component: TripWorkspaceLayout,
});

function TripWorkspaceLayout() {
  const { tripId } = Route.useLoaderData();
  const [showMinLoader, setShowMinLoader] = useState(true);

  const { data, isLoading, error } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripApi.getTrip(tripId),
  });

  const { socket } = useSocket();

  useEffect(() => {
    if (socket && tripId) {
      socket.emit('trip:join', tripId);

      return () => {
        // Optional: emit trip:leave if backend requires it, but joining a new trip is fine
      };
    }
  }, [socket, tripId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMinLoader(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || showMinLoader) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] w-full items-center justify-center bg-white">
        <div className="w-48 h-48 flex items-center justify-center">
          <DotLottiePlayer
            src={loaderUrl}
            autoplay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)] p-8 items-center justify-center text-center font-manrope text-sm md:text-base font-semibold text-rose-600 bg-white">
        Failed to load trip workspace.
      </div>
    );
  }

  const trip = data.data.trip;

  return (
    <>
      <div className="flex h-[calc(100vh-3.5rem)] w-full overflow-hidden bg-white relative">
        <div className="flex-1 flex flex-col overflow-y-auto bg-[#F5F5F7]">
          <WorkspaceHeader trip={trip} />
          <WorkspaceTabs tripId={trip.id} role={trip.role} />
          <div className="w-full px-4 md:px-8 pt-2 md:pt-3 pb-6 flex-1 space-y-6 bg-[#F5F5F7]">
            <div>
              <Outlet />
            </div>
          </div>
        </div>

        <div className="w-96 shrink-0 border-l hidden lg:block bg-card z-10 relative">
          <CommunicationPanel tripId={trip.id} />
        </div>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger
              className="fixed bottom-6 right-4 md:right-6 z-60 p-3.5 md:p-4 rounded-full text-white transition-all duration-300 hover:-translate-y-1 active:scale-95 group flex items-center justify-center border border-white/30 overflow-hidden shrink-0 cursor-pointer focus:outline-none"
              style={{
                background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.5),
                  inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
                  0 8px 30px rgba(16, 185, 129, 0.45),
                  0 3px 6px 0 rgba(0, 0, 0, 0.12)
                `,
              }}
              aria-label="Open Communication Panel"
            >
              <div className="absolute inset-x-2 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
              <HugeiconsIcon
                icon={Chat01Icon}
                className="w-6 h-6 md:w-7 md:h-7 relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]"
              />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="data-[side=right]:w-full data-[side=right]:max-w-full md:data-[side=right]:w-120 md:data-[side=right]:max-w-120 p-0 border-l border-neutral-200/50 bg-[#F5F5F7] shadow-2xl z-70"
            >
              <CommunicationPanel tripId={trip.id} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  );
}
