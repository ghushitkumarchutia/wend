import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';

export function DangerZoneSection() {
  const { signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setConfirmationText('');
      setPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmationText !== 'delete my account') {
      toast.error('Confirmation text does not match.');
      return;
    }

    try {
      setIsDeleting(true);
      await accountApi.deleteAccount({
        confirmation: confirmationText,
        currentPassword: password || undefined,
      });
      toast.success('Account deleted successfully.');
      handleOpenChange(false);
      signOut();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete account.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-white/35 font-manrope select-none"
      style={{
        background: 'linear-gradient(145deg, #F43F5E 0%, #E11D48 100%)',
        boxShadow: `
          inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
          inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
          0 6px 16px -2px rgba(225, 29, 72, 0.45),
          0 3px 6px 0 rgba(0, 0, 0, 0.12)
        `,
      }}
    >
      <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

      <div className="text-white p-4.5 md:p-6 space-y-4 md:space-y-5">
        <div>
          <h3 className="text-lg md:text-xl font-bold tracking-normal text-white font-syne">
            Danger Zone
          </h3>
          <p className="text-xs text-white/80 font-manrope mt-0.5">
            Irreversible and destructive actions for your account.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 md:p-4 rounded-2xl border border-white/20 bg-black/10 backdrop-blur-md shadow-xs">
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm font-syne text-white">Delete Account</h4>
            <p className="text-xs text-white/75 font-manrope">
              Permanently delete your account and all of your personal data.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger
              render={
                <Button
                  type="button"
                  variant="waterdrop"
                  className="h-9.5 md:h-10 px-5 md:px-6 text-xs md:text-sm font-bold font-manrope text-rose-950 border border-white/90 flex items-center justify-center rounded-full! cursor-pointer active:scale-97 shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
                    boxShadow: `
                      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                      inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.08),
                      0 4px 12px -2px rgba(0, 0, 0, 0.2)
                    `,
                  }}
                >
                  Delete Account
                </Button>
              }
            />

            <DialogContent
              showCloseButton={false}
              className="max-w-[92vw] md:max-w-110 rounded-3xl md:rounded-[32px] ring-0 bg-white p-6 md:p-7 border border-black/5 shadow-2xl gap-0 font-manrope"
            >
              <DialogHeader className="text-center flex flex-col items-center justify-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100/80 text-rose-600 border border-rose-200/60 mb-3 shadow-2xs">
                  <HugeiconsIcon icon={Alert02Icon} className="h-6 w-6" strokeWidth={2} />
                </div>
                <DialogTitle className="text-xl md:text-2xl font-bold text-rose-600 font-syne text-center tracking-tight">
                  Delete Account
                </DialogTitle>
                <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed mt-2">
                  This action cannot be undone. This will permanently delete your account, remove
                  your data from our servers, and cancel all trip memberships.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4 mt-5">
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="confirmation"
                    className="text-xs md:text-sm font-medium font-manrope text-neutral-700 select-none text-center"
                  >
                    Type <span className="font-bold text-rose-600">delete my account</span> to
                    confirm
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    disabled={isDeleting}
                    placeholder="delete my account"
                    className="bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 rounded-xl h-10 px-4 text-xs md:text-sm font-manrope text-center text-neutral-900 placeholder:text-neutral-400 transition-all duration-200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="password"
                    className="text-xs md:text-sm font-medium font-manrope text-neutral-700 select-none text-center"
                  >
                    Current Password{' '}
                    <span className="text-neutral-400 font-normal">(optional if using SSO)</span>
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isDeleting}
                    placeholder="Enter password"
                    className="bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white border border-neutral-200/80 focus-visible:ring-2 focus-visible:ring-rose-500/20 focus-visible:border-rose-500 rounded-xl h-10 px-4 text-xs md:text-sm font-manrope text-center text-neutral-900 placeholder:text-neutral-400 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-2.5 md:gap-3 mt-6">
                <Button
                  type="button"
                  variant="waterdrop"
                  disabled={isDeleting}
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-neutral-800 border border-white/90 cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
                    boxShadow: `
                      inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                      inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.08),
                      0 4px 12px -2px rgba(0, 0, 0, 0.08),
                      0 1px 3px 0 rgba(0, 0, 0, 0.05)
                    `,
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant="waterdrop"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting || confirmationText !== 'delete my account'}
                  className="flex-1 h-10 md:h-11 text-xs md:text-sm font-bold font-manrope text-white border border-white/35 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
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
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
