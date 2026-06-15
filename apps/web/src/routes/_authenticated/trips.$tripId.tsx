import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/trips/$tripId')({
  component: TripPage,
});

function TripPage() {
  const { tripId } = Route.useParams();
  return <div>Trip {tripId}</div>;
}
