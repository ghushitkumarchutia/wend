/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router';
import { LandingNavbar } from '@/features/landing/landing-navbar';
import { LandingFooter } from '@/features/landing/landing-footer';
import { ExplorePage } from '@/features/explore/explore-page';

export const Route = createFileRoute('/explore/')({
  component: ExploreRoute,
});

function ExploreRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <ExplorePage />
      <LandingFooter />
    </div>
  );
}
