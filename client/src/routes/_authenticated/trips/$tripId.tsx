import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/trips/$tripId')({
  loader: async ({ params: { tripId } }) => {
    return { tripId };
  },
});
