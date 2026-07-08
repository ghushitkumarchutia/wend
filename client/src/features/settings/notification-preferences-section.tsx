import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NotificationPreferences } from '@/types/api';

export function NotificationPreferencesSection() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: accountApi.getNotificationPreferences,
  });

  const mutation = useMutation({
    mutationFn: (updates: Partial<NotificationPreferences>) =>
      accountApi.updateNotificationPreferences(updates),
    onSuccess: (updatedData) => {
      queryClient.setQueryData(['notification-preferences'], updatedData);
      toast.success('Notification preferences updated.');
    },
    onError: (error) => {
      const msg = error instanceof Error ? error.message : 'Failed to update preferences.';
      toast.error(msg);
    },
  });

  const handleToggleEmail = (key: keyof NotificationPreferences['email']) => {
    if (!data?.data?.email) return;
    const newEmailPrefs = {
      ...data.data.email,
      [key]: !data.data.email[key],
    };
    mutation.mutate({ email: newEmailPrefs });
  };

  const handleTogglePush = (key: keyof NotificationPreferences['push']) => {
    if (!data?.data?.push) return;
    const newPushPrefs = {
      ...data.data.push,
      [key]: !data.data.push[key],
    };
    mutation.mutate({ push: newPushPrefs });
  };

  if (isLoading) {
    return <div>Loading preferences...</div>;
  }

  const prefs = data?.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Choose what notifications you want to receive and how.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Email Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Trip Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when you are invited to a trip.
                </p>
              </div>
              <Switch
                checked={prefs?.email?.trip_invites ?? false}
                onCheckedChange={() => handleToggleEmail('trip_invites')}
                disabled={mutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Trip Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive emails when trip details change.
                </p>
              </div>
              <Switch
                checked={prefs?.email?.trip_updates ?? false}
                onCheckedChange={() => handleToggleEmail('trip_updates')}
                disabled={mutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Daily Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a daily summary of trip activities.
                </p>
              </div>
              <Switch
                checked={prefs?.email?.daily_digest ?? false}
                onCheckedChange={() => handleToggleEmail('daily_digest')}
                disabled={mutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and offers.
                </p>
              </div>
              <Switch
                checked={prefs?.email?.marketing ?? false}
                onCheckedChange={() => handleToggleEmail('marketing')}
                disabled={mutation.isPending}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Push Notifications</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Trip Invites</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for new invites.
                </p>
              </div>
              <Switch
                checked={prefs?.push?.trip_invites ?? false}
                onCheckedChange={() => handleTogglePush('trip_invites')}
                disabled={mutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Trip Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for trip changes.
                </p>
              </div>
              <Switch
                checked={prefs?.push?.trip_updates ?? false}
                onCheckedChange={() => handleTogglePush('trip_updates')}
                disabled={mutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Chat Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications when you are mentioned.
                </p>
              </div>
              <Switch
                checked={prefs?.push?.chat_mentions ?? false}
                onCheckedChange={() => handleTogglePush('chat_mentions')}
                disabled={mutation.isPending}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications for upcoming events.
                </p>
              </div>
              <Switch
                checked={prefs?.push?.reminders ?? false}
                onCheckedChange={() => handleTogglePush('reminders')}
                disabled={mutation.isPending}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
