import { createFileRoute } from '@tanstack/react-router';
import { LandingNavbar } from '@/features/landing/landing-navbar';
import { HeroSection } from '@/features/landing/hero-section';
import { HowItWorksSection } from '@/features/landing/how-it-works-section';
import { FeatureHighlightsSection } from '@/features/landing/feature-highlights-section';
import { FaqSection } from '@/features/landing/faq-section';
import { LandingFooter } from '@/features/landing/landing-footer';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen">
      <LandingNavbar />
      <main className="pt-14">
        <HeroSection />
        <HowItWorksSection />
        <FeatureHighlightsSection />
        <FaqSection />
      </main>
      <LandingFooter />
    </div>
  );
}
