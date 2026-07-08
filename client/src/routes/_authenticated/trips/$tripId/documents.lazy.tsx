import { createLazyFileRoute } from '@tanstack/react-router';
import { DocumentsPage } from '@/features/documents/documents-page';

export const Route = createLazyFileRoute('/_authenticated/trips/$tripId/documents')({
  component: DocumentsRoute,
});

function DocumentsRoute() {
  const { tripId } = Route.useParams();
  return <DocumentsPage tripId={tripId} />;
}
