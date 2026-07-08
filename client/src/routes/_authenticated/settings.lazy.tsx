import { createLazyFileRoute } from '@tanstack/react-router';
import { ProfileSection } from '@/features/settings/profile-section';
import { SecuritySection } from '@/features/settings/security-section';
import { NotificationPreferencesSection } from '@/features/settings/notification-preferences-section';
import { ConnectedAccountsSection } from '@/features/settings/connected-accounts-section';
import { DangerZoneSection } from '@/features/settings/danger-zone-section';

export const Route = createLazyFileRoute('/_authenticated/settings')({
  component: SettingsRoute,
});

function SettingsRoute() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-10 w-full max-w-4xl mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account profile, security, and notifications.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <ProfileSection />
        <SecuritySection />
        <ConnectedAccountsSection /> <NotificationPreferencesSection />
        <DangerZoneSection />
      </div>
    </div>
  );
}
