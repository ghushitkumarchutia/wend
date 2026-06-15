import { Calendar, Wallet, MessageSquare, FileText, Zap, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Calendar,
    title: 'Collaborative Itinerary Builder',
    description:
      'Plan day-by-day with drag-and-drop events. Everyone sees changes in real time — no more conflicting spreadsheets.',
  },
  {
    icon: Wallet,
    title: 'Shared Expense Ledger',
    description:
      'Log expenses, split costs four different ways, and see who owes whom instantly. Settlement suggestions included.',
  },
  {
    icon: MessageSquare,
    title: 'Group Chat & Polls',
    description:
      'Discuss plans in-context, create polls to make group decisions, and keep everyone on the same page.',
  },
  {
    icon: FileText,
    title: 'Document Storage',
    description:
      'Upload booking confirmations, visas, and tickets. Everything your group needs, securely in one place.',
  },
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description:
      'See changes the moment they happen. Activity feeds and notifications keep every member informed.',
  },
  {
    icon: Compass,
    title: 'Explore Curated Templates',
    description:
      'Browse community-curated trip templates for popular destinations and clone them into your own trip.',
  },
];

export function FeatureHighlightsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Everything You Need to Plan Together
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-muted-foreground">
          Purpose-built for group travel, not adapted from a generic project tool.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-muted/60">
              <CardContent className="p-6">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
