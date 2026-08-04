/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from '@tanstack/react-router';
import { ExplorePage } from '@/features/explore/explore-page';

export const Route = createFileRoute('/_authenticated/explore')({
  component: ExploreRoute,
});

function ExploreRoute() {
  return <ExplorePage />;
}
