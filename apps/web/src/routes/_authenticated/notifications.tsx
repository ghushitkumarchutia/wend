import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/notifications')({
  component: NotificationsPage,
});

function NotificationsPage() {
  return <div>Notifications</div>;
}
