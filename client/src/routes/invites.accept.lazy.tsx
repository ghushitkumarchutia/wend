import { createLazyFileRoute, useRouter } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { invitesApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Sent02Icon,
  Cancel01Icon,
  CheckCheckIcon,
  Alert02Icon,
  User02Icon,
} from '@hugeicons/core-free-icons';

export const Route = createLazyFileRoute('/invites/accept')({
  component: InvitesAcceptRoute,
});

function InvitesAcceptRoute() {
  const { token } = Route.useSearch();
  const { user, isPending } = useAuth();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !user && token) {
      router.navigate({
        to: '/sign-in',
      });
    }
  }, [isPending, user, token, router]);

  const handleAccept = async () => {
    if (!token) return;
    try {
      setIsProcessing(true);
      setError(null);
      await invitesApi.accept(token);
      toast.success('Invite accepted successfully!');
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to accept invite.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!token) return;
    try {
      setIsProcessing(true);
      setError(null);
      await invitesApi.decline(token);
      toast.success('Invite declined.');
      router.navigate({ to: '/dashboard' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to decline invite.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isPending || (!user && token)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] font-manrope p-4 select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold font-syne text-neutral-700">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] font-manrope p-4 select-none">
        <div className="relative w-full max-w-[92vw] sm:max-w-115 rounded-3xl md:rounded-[36px] bg-white p-1.5 shadow-2xl border border-neutral-200/50">
          <div
            className="w-full rounded-[26px] md:rounded-[30px] p-6 md:p-8 flex flex-col items-center text-center"
            style={{
              background: 'linear-gradient(to top, #FEE2E2 0%, #FFFFFF 100%)',
            }}
          >
            <div className="w-14 h-14 rounded-2xl bg-rose-100/90 border border-rose-200/70 flex items-center justify-center mb-4 shadow-2xs">
              <HugeiconsIcon icon={Alert02Icon} className="w-7 h-7 text-rose-600" strokeWidth={1.8} />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 font-syne">
              Invalid Invite
            </h2>
            <p className="text-xs md:text-sm text-neutral-500 font-manrope mt-2 leading-relaxed max-w-sm">
              No invite token was provided in the URL or the link has expired. Please ask the trip organizer to resend your invitation.
            </p>

            <Button
              type="button"
              variant="waterdrop"
              onClick={() => router.navigate({ to: '/dashboard' })}
              className="w-full mt-7 h-11 md:h-12 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer"
              style={{
                background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 14px -2px rgba(16, 185, 129, 0.4),
                  0 1px 3px 0 rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] font-manrope p-4 select-none">
      <div className="relative w-full max-w-[92vw] sm:max-w-115 rounded-3xl md:rounded-[36px] bg-white p-1.5 shadow-2xl border border-neutral-200/50">
        <div
          className="w-full rounded-[26px] md:rounded-[30px] p-6 md:p-8 flex flex-col items-center text-center"
          style={{
            background: 'linear-gradient(to top, #D1FAE5 0%, #FFFFFF 100%)',
          }}
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100/90 border border-emerald-200/70 flex items-center justify-center mb-4 shadow-2xs">
            <HugeiconsIcon icon={Sent02Icon} className="w-7 h-7 text-emerald-600" strokeWidth={1.8} />
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 font-syne">
            Trip Invitation
          </h1>
          <p className="text-xs md:text-sm text-neutral-500 font-manrope mt-1.5 leading-relaxed max-w-sm">
            You've been invited to join a trip workspace on Wend. Once accepted, you can collaborate on itineraries, expenses, and travel documents.
          </p>

          {user && (
            <div className="w-full mt-5 p-3 rounded-2xl bg-white/90 backdrop-blur-md border border-neutral-200/60 flex items-center gap-3 text-left shadow-2xs">
              <Avatar className="h-9 w-9 border border-neutral-200/50 shrink-0">
                <AvatarImage src={user.image || ''} alt={user.name || ''} />
                <AvatarFallback className="bg-emerald-50 text-emerald-700 font-syne font-bold text-xs">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-neutral-900 font-syne truncate">
                  {user.name || 'Signed In User'}
                </p>
                <p className="text-[11px] font-medium text-neutral-500 font-manrope truncate">
                  {user.email}
                </p>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-semibold font-manrope shrink-0">
                <HugeiconsIcon icon={User02Icon} className="size-3" strokeWidth={2} />
                <span>Active</span>
              </div>
            </div>
          )}

          {error && (
            <div className="w-full mt-3.5 p-3 rounded-2xl bg-rose-50/90 border border-rose-200/70 flex items-center gap-3 text-left shadow-2xs animate-in fade-in zoom-in-95 duration-200">
              <div className="h-9 w-9 rounded-xl bg-white border border-rose-200/60 flex items-center justify-center shrink-0 shadow-2xs">
                <HugeiconsIcon icon={Alert02Icon} className="h-4.5 w-4.5 text-rose-600" strokeWidth={1.8} />
              </div>
              <p className="text-xs md:text-sm font-semibold text-rose-900 font-manrope leading-snug flex-1">
                {error}
              </p>
            </div>
          )}

          <div className="flex gap-2.5 md:gap-3 w-full mt-6">
            <Button
              type="button"
              variant="waterdrop"
              disabled={isProcessing}
              onClick={handleDecline}
              className="flex-1 h-11 md:h-12 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #F85252 0%, #E63946 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 14px -2px rgba(230, 57, 70, 0.4),
                  0 1px 3px 0 rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1 text-white" strokeWidth={2} />
              Decline
            </Button>

            <Button
              type="button"
              variant="waterdrop"
              disabled={isProcessing}
              onClick={handleAccept}
              className="flex-1 h-11 md:h-12 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 14px -2px rgba(16, 185, 129, 0.4),
                  0 1px 3px 0 rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              <HugeiconsIcon icon={CheckCheckIcon} className="w-4 h-4 mr-1" strokeWidth={2} />
              {isProcessing ? 'Accepting...' : 'Accept Invite'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

