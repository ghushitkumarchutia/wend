import { MapPin, Users, CalendarCheck, Plane } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    icon: MapPin,
    title: 'Create a trip',
    description: 'Add your destination, dates, and budget in seconds.',
  },
  {
    icon: Users,
    title: 'Invite your group',
    description: 'Everyone joins with one link, at whatever access level you choose.',
  },
  {
    icon: CalendarCheck,
    title: 'Plan together',
    description: 'Build the itinerary, split expenses, and decide as a group in real time.',
  },
  {
    icon: Plane,
    title: 'Travel confidently',
    description: 'Everything is organized and accessible from any device.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="border-t bg-muted/30 py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          How It Works
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
          From idea to itinerary in four simple steps.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="size-7 text-primary" />
              </div>
              <span className="mt-3 text-xs font-semibold text-muted-foreground">
                Step {i + 1}
              </span>
              <h3 className="mt-1 text-base font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
