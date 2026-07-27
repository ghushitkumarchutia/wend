import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { Mail, Bell } from 'lucide-react';
import type { NotificationPreferences } from '@/types/api';

const cardStyle = {
  background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
  boxShadow: `
    inset 0 1.5px 2px 0 #FFFFFF,
    inset 0 -2px 4px 0 rgba(0, 0, 0, 0.02),
    0 8px 24px -4px rgba(0, 0, 0, 0.06),
    0 2px 6px 0 rgba(0, 0, 0, 0.03)
  `,
};

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

  const prefs = data?.data;

  if (isLoading) {
    return (
      <div
        className="relative rounded-3xl overflow-hidden border border-slate-200/80 font-manrope select-none p-4.5 md:p-6 space-y-6"
        style={cardStyle}
      >
        <div className="space-y-2 animate-pulse">
          <div className="h-6 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-[#F5F5F7] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-slate-200/80 font-manrope select-none"
      style={cardStyle}
    >
      <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white via-white/50 to-transparent pointer-events-none" />
      <div className="text-neutral-900 p-4.5 md:p-6 space-y-6 md:space-y-7">
        {/* Section Header */}
        <div>
          <h3 className="text-lg md:text-xl font-bold tracking-normal text-neutral-900 font-syne">
            Notification Preferences
          </h3>
          <p className="text-xs text-slate-500 font-manrope mt-0.5">
            Choose what notifications you want to receive and how you prefer to be reached.
          </p>
        </div>

        {/* Email Notifications Group */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 text-emerald-600">
              <Mail className="size-4" />
            </div>
            <h4 className="text-sm font-bold font-syne text-neutral-900 tracking-wide">
              Email Notifications
            </h4>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="email-trip-invites" className="text-xs md:text-sm font-bold font-manrope text-neutral-900 cursor-pointer">
                  Trip Invites
                </Label>
                <p className="text-xs font-medium font-manrope text-slate-500">
                  Receive email invitations when added to a trip.
                </p>
              </div>
              <Switch
                id="email-trip-invites"
                checked={prefs?.email?.trip_invites ?? false}
                onCheckedChange={() => handleToggleEmail('trip_invites')}
                disabled={mutation.isPending}
                className="data-checked:bg-emerald-500! data-checked:border-emerald-600! cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="email-trip-updates" className="text-xs md:text-sm font-bold font-manrope text-neutral-900 cursor-pointer">
                  Trip Updates
                </Label>
                <p className="text-xs font-medium font-manrope text-slate-500">
                  Receive email alerts when itinerary or itinerary events change.
                </p>
              </div>
              <Switch
                id="email-trip-updates"
                checked={prefs?.email?.trip_updates ?? false}
                onCheckedChange={() => handleToggleEmail('trip_updates')}
                disabled={mutation.isPending}
                className="data-checked:bg-emerald-500! data-checked:border-emerald-600! cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="email-daily-digest" className="text-xs md:text-sm font-bold font-manrope text-neutral-900 cursor-pointer">
                  Daily Digest
                </Label>
                <p className="text-xs font-medium font-manrope text-slate-500">
                  Receive a daily summary email of trip expenses and activities.
                </p>
              </div>
              <Switch
                id="email-daily-digest"
                checked={prefs?.email?.daily_digest ?? false}
                onCheckedChange={() => handleToggleEmail('daily_digest')}
                disabled={mutation.isPending}
                className="data-checked:bg-emerald-500! data-checked:border-emerald-600! cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="email-marketing" className="text-xs md:text-sm font-bold font-manrope text-neutral-900 cursor-pointer">
                  Feature & Product News
                </Label>
                <p className="text-xs font-medium font-manrope text-slate-500">
                  Occasional product announcements and travel tips.
                </p>
              </div>
              <Switch
                id="email-marketing"
                checked={prefs?.email?.marketing ?? false}
                onCheckedChange={() => handleToggleEmail('marketing')}
                disabled={mutation.isPending}
                className="data-checked:bg-emerald-500! data-checked:border-emerald-600! cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Push Notifications Group */}
        <div className="space-y-3.5 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white border border-slate-200/80 shadow-2xs shrink-0 text-emerald-600">
              <Bell className="size-4" />
            </div>
            <h4 className="text-sm font-bold font-syne text-neutral-900 tracking-wide">
              Push Notifications
            </h4>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="push-trip-invites" className="text-xs md:text-sm font-bold font-manrope text-neutral-900 cursor-pointer">
                  Trip Invites
                </Label>
                <p className="text-xs font-medium font-manrope text-slate-500">
                  Receive instant push notifications for new trip invitations.
                </p>
              </div>
              <Switch
                id="push-trip-invites"
                checked={prefs?.push?.trip_invites ?? false}
                onCheckedChange={() => handleTogglePush('trip_invites')}
                disabled={mutation.isPending}
                className="data-checked:bg-emerald-500! data-checked:border-emerald-600! cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="push-trip-updates" className="text-xs md:text-sm font-bold font-manrope text-neutral-900 cursor-pointer">
                  Trip Updates
                </Label>
                <p className="text-xs font-medium font-manrope text-slate-500">
                  Receive push alerts when group members update shared plans.
                </p>
              </div>
              <Switch
                id="push-trip-updates"
                checked={prefs?.push?.trip_updates ?? false}
                onCheckedChange={() => handleTogglePush('trip_updates')}
                disabled={mutation.isPending}
                className="data-checked:bg-emerald-500! data-checked:border-emerald-600! cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="push-chat-mentions" className="text-xs md:text-sm font-bold font-manrope text-neutral-900 cursor-pointer">
                  Chat Mentions
                </Label>
                <p className="text-xs font-medium font-manrope text-slate-500">
                  Receive push notifications when someone mentions you in trip chat.
                </p>
              </div>
              <Switch
                id="push-chat-mentions"
                checked={prefs?.push?.chat_mentions ?? false}
                onCheckedChange={() => handleTogglePush('chat_mentions')}
                disabled={mutation.isPending}
                className="data-checked:bg-emerald-500! data-checked:border-emerald-600! cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
              <div className="space-y-0.5 pr-4">
                <Label htmlFor="push-reminders" className="text-xs md:text-sm font-bold font-manrope text-neutral-900 cursor-pointer">
                  Upcoming Event Reminders
                </Label>
                <p className="text-xs font-medium font-manrope text-slate-500">
                  Receive reminders right before scheduled itinerary activities.
                </p>
              </div>
              <Switch
                id="push-reminders"
                checked={prefs?.push?.reminders ?? false}
                onCheckedChange={() => handleTogglePush('reminders')}
                disabled={mutation.isPending}
                className="data-checked:bg-emerald-500! data-checked:border-emerald-600! cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
