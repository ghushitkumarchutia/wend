import { Link } from '@tanstack/react-router';
import { buttonVariants } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HeroSection() {
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 bg-muted/30">
      <div className="container px-4 md:px-6 mx-auto flex flex-col items-center text-center space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Group Travel, <span className="text-primary">Simplified.</span>
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl">
          Wend is your all-in-one workspace for planning trips, splitting expenses, and keeping everyone on the same page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/sign-up" className={cn(buttonVariants({ size: "lg" }), "h-12 px-8")}>
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link to="/explore" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-12 px-8")}>
            Explore Templates
          </Link>
        </div>
      </div>
    </section>
  );
}
