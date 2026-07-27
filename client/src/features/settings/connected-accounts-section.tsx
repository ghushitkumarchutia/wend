import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { accountApi } from '@/lib/api-client';
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';

const GOOGLE_LOGO_URL =
  'https://cdn.brandfetch.io/id6O2oGzv-/theme/dark/symbol.svg?c=1bxid64Mup7aczewSAYMX&t=1755835725776';

export function ConnectedAccountsSection() {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const { data: profileData } = useQuery({
    queryKey: ['account-profile'],
    queryFn: () => accountApi.getProfile(),
  });

  const hasGoogle = profileData?.data?.hasGoogle ?? false;
  const hasPassword = profileData?.data?.hasPassword ?? false;

  const handleConnectGoogle = async () => {
    try {
      setIsLoading(true);
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/settings`,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to connect Google account.';
      toast.error(msg);
      setIsLoading(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!hasPassword) {
      toast.error('You must set a password before disconnecting your Google account.');
      return;
    }

    try {
      setIsLoading(true);
      await accountApi.disconnectGoogle();
      toast.success('Google account disconnected.');
      queryClient.invalidateQueries({ queryKey: ['account-profile'] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to disconnect Google account.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-slate-200/80 font-manrope select-none"
      style={{
        background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
        boxShadow: `
          inset 0 1.5px 2px 0 #FFFFFF,
          inset 0 -2px 4px 0 rgba(0, 0, 0, 0.02),
          0 8px 24px -4px rgba(0, 0, 0, 0.06),
          0 2px 6px 0 rgba(0, 0, 0, 0.03)
        `,
      }}
    >
      <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white via-white/50 to-transparent pointer-events-none" />
      <div className="text-neutral-900 p-4.5 md:p-6 space-y-4 md:space-y-5">
        <div>
          <h3 className="text-lg md:text-xl font-bold tracking-normal text-neutral-900 font-syne">
            Connected Accounts
          </h3>
          <p className="text-xs text-slate-500 font-manrope mt-0.5">
            Manage your connected social accounts for quick login and single sign-on.
          </p>
        </div>

        <div className="flex items-center justify-between p-3.5 md:p-4 rounded-2xl border border-slate-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] transition-all duration-200 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[20px] bg-white border border-slate-200/80 shadow-2xs p-2 shrink-0">
              <img src={GOOGLE_LOGO_URL} alt="Google" className="size-5 object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold font-manrope text-neutral-900">Google</p>
              <p
                className={`text-xs font-semibold font-manrope ${
                  hasGoogle ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {hasGoogle ? 'Connected' : 'Not connected'}
              </p>
            </div>
          </div>

          {hasGoogle ? (
            <Button
              variant="waterdrop"
              onClick={handleDisconnectGoogle}
              disabled={isLoading || !hasPassword}
              title={!hasPassword ? 'Set a password first before disconnecting Google' : undefined}
              className="h-9 px-4 text-xs font-bold font-manrope text-white border border-white/35 flex items-center justify-center rounded-full! cursor-pointer active:scale-97 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #F85252 0%, #E63946 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 12px -2px rgba(230, 57, 70, 0.4)
                `,
              }}
            >
              {isLoading ? 'Processing...' : 'Disconnect'}
            </Button>
          ) : (
            <Button
              variant="waterdrop"
              onClick={handleConnectGoogle}
              disabled={isLoading}
              className="h-9 px-4 text-xs font-bold font-manrope text-white border border-white/35 flex items-center justify-center rounded-full! cursor-pointer active:scale-97 disabled:opacity-50"
              style={{
                background: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 12px -2px rgba(16, 185, 129, 0.4)
                `,
              }}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>

        {hasGoogle && !hasPassword && (
          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3 md:p-3.5">
            <p className="text-xs text-amber-800 font-medium font-manrope leading-relaxed">
              Set a password in the Security section above before disconnecting Google — otherwise you'll lose access to your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
