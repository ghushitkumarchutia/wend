import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/trips/$tripId/ledger')({
  loader: () => {
    // Optionally trigger prefetch here
  },
});
