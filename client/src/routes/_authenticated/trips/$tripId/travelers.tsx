import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/trips/$tripId/travelers')({
  loader: () => {
    // Optionally trigger prefetch here
  }
});
