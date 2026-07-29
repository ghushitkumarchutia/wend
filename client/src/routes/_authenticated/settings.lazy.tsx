/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { createLazyFileRoute, Link } from '@tanstack/react-router';
import { ProfileSection } from '@/features/settings/profile-section';
import { SecuritySection } from '@/features/settings/security-section';
import { NotificationPreferencesSection } from '@/features/settings/notification-preferences-section';
import { ConnectedAccountsSection } from '@/features/settings/connected-accounts-section';
import { DangerZoneSection } from '@/features/settings/danger-zone-section';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft02Icon } from '@hugeicons/core-free-icons';
import { DotLottiePlayer } from '@dotlottie/react-player';
import loaderUrl from '@/assets/lottie/loader.lottie?url';

export const Route = createLazyFileRoute('/_authenticated/settings')({
  component: SettingsRoute,
});

function SettingsRoute() {
  const [showMinLoader, setShowMinLoader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMinLoader(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (showMinLoader) {
    return (
      <div className="w-full min-h-[calc(100vh-3.5rem)] bg-[#F5F5F7] flex items-center justify-center py-24">
        <div className="w-28 h-28 md:w-36 md:h-36 flex items-center justify-center">
          <DotLottiePlayer
            src={loaderUrl}
            autoplay
            loop
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-[calc(100vh-3.5rem)] bg-[#F5F5F7]">
      <div className="flex flex-col gap-2.5 md:gap-6 p-6 lg:p-10 w-full max-w-4xl mx-auto">
        <div className="flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold font-manrope text-neutral-600 hover:text-neutral-900 transition-colors duration-200 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 rounded-md"
          >
            <HugeiconsIcon
              icon={ArrowLeft02Icon}
              className="h-4 w-4 md:h-4.5 md:w-4.5 text-neutral-600 group-hover:text-neutral-900 transition-transform duration-200 group-hover:-translate-x-1"
              strokeWidth={2}
            />
            <span className="transition-colors duration-200">Back to Dashboard</span>
          </Link>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-syne text-neutral-900">
            Account Settings
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 font-manrope">
            Manage your account profile, security, and notifications.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          <ProfileSection />
          <SecuritySection />
          <ConnectedAccountsSection />
          <NotificationPreferencesSection />
          <DangerZoneSection />
        </div>
      </div>
    </div>
  );
}
