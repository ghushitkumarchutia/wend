/* eslint-disable react-refresh/only-export-components */
import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/')({
  component: DashboardIndex,
});

function DashboardIndex() {
  return <Navigate to="/templates" />;
}
