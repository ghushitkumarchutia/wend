import { createFileRoute } from '@tanstack/react-router';
import { ExplorePage } from '@/features/explore/explore-page';

export const Route = createFileRoute('/explore')({
  component: ExplorePage,
});
