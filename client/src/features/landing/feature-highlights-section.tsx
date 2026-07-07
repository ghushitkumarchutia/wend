import { MapPin, Users, Calculator } from 'lucide-react';

export function FeatureHighlightsSection() {
  return (
    <section className="w-full py-20 bg-background">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Collaborative Itineraries</h3>
            <p className="text-muted-foreground">Build and vote on timelines together in real-time.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Calculator className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Automated Ledger</h3>
            <p className="text-muted-foreground">Log expenses, split costs, and settle debts automatically.</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-primary/10 rounded-full text-primary">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold">Real-time Chat & Polls</h3>
            <p className="text-muted-foreground">Keep the conversation inside the trip workspace.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
