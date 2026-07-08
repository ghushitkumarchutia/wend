import { createFileRoute } from '@tanstack/react-router';
import { HeroSection } from '@/features/landing/hero-section';
import { FeatureHighlightsSection } from '@/features/landing/feature-highlights-section';
import { LandingNavbar } from '@/features/landing/landing-navbar';
import { LandingFooter } from '@/features/landing/landing-footer';

export const Route = createFileRoute('/')({
  component: LandingPageRoute,
});

function LandingPageRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <FeatureHighlightsSection />
      </main>
      <LandingFooter />
    </div>
  );
}
