import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/trips/$tripId')({
  component: TripWorkspacePlaceholder,
});

function TripWorkspacePlaceholder() {
  return <div>Trip Workspace Placeholder</div>;
}
