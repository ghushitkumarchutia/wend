/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router';
import { LandingNavbar } from '@/features/landing/landing-navbar';
import { LandingFooter } from '@/features/landing/landing-footer';

export const Route = createFileRoute('/explore/')({
  component: ExploreRoute,
});

function ExploreRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1 container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Explore Templates</h1>
        <p className="text-muted-foreground">
          Discover trips created by the community. Template cloning coming soon.
        </p>
      </main>
      <LandingFooter />
    </div>
  );
}
