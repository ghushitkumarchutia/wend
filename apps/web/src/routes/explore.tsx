import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/explore')({
  component: ExplorePage,
});

function ExplorePage() {
  return <div>Explore</div>;
}
