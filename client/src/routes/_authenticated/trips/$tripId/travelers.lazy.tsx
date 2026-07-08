import { createLazyFileRoute } from '@tanstack/react-router';
import { TravelersPage } from '@/features/travelers/travelers-page';

export const Route = createLazyFileRoute('/_authenticated/trips/$tripId/travelers')({
  component: TravelersRoute,
});

function TravelersRoute() {
  const { tripId } = Route.useParams();
  return <TravelersPage tripId={tripId} />;
}
