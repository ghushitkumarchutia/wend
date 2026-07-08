import { createLazyFileRoute } from '@tanstack/react-router';
import { ItineraryTimeline } from '@/features/itinerary/itinerary-timeline';

export const Route = createLazyFileRoute('/_authenticated/trips/$tripId/')({
  component: ItineraryRoute,
});

function ItineraryRoute() {
  const { tripId } = Route.useParams();
  return <ItineraryTimeline tripId={tripId} />;
}
