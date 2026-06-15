import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function HeroSection() {
  return (
    <section className="relative flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-20%,oklch(0.488_0.243_264.376/0.15),transparent)]" />

      <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        Plan trips together,{' '}
        <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          stress-free.
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
        Wend brings your whole group onto the same page — itinerary, budget, chat, and decisions,
        all in one place.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link to="/sign-up">
          <Button size="lg">
            Get Started Free
            <ArrowRight className="ml-1 size-4" />
          </Button>
        </Link>
        <Link to="/sign-in">
          <Button variant="outline" size="lg">
            Sign In
          </Button>
        </Link>
      </div>
    </section>
  );
}
