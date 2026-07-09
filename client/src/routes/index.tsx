import { createFileRoute } from '@tanstack/react-router';
import { HeroSection } from '@/features/landing/hero-section';
import { PartnersSection } from '@/features/landing/partners-section';
import { TripsCarouselSection } from '@/features/landing/trips-carousel-section';
import { PlacesSelectorSection } from '@/features/landing/places-selector-section';
import { StatsHighlightsSection } from '@/features/landing/stats-highlights-section';
import { FeaturesShowcaseSection } from '@/features/landing/features-showcase-section';
import { FAQSection } from '@/features/landing/faq-section';
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
        <PartnersSection />
        <TripsCarouselSection />
        <PlacesSelectorSection />
        <StatsHighlightsSection />
        <FeaturesShowcaseSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  );
}
