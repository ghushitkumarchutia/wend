import { createLazyFileRoute } from '@tanstack/react-router';
import { LedgerPage } from '@/features/ledger/ledger-page';

export const Route = createLazyFileRoute('/_authenticated/trips/$tripId/ledger')({
  component: LedgerRoute,
});

function LedgerRoute() {
  const { tripId } = Route.useParams();
  return <LedgerPage tripId={tripId} />;
}
