import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { accountApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

const labelCls =
  'text-xs font-semibold font-syne text-neutral-900 tracking-wide select-none flex items-center gap-1.5';
const inputCls =
  'h-10 rounded-xl border border-neutral-200/80 bg-[#F5F5F7] hover:bg-[#EEEEEF] focus:bg-white text-neutral-900 placeholder:text-neutral-400 text-xs md:text-sm font-manrope font-medium focus-visible:ring-2! focus-visible:ring-emerald-500/20! focus-visible:border-emerald-500! transition-all duration-200 shadow-2xs';

const cardStyle = {
  background: 'linear-gradient(145deg, #FFFFFF 0%, #F8FAFC 100%)',
  boxShadow: `
    inset 0 1.5px 2px 0 #FFFFFF,
    inset 0 -2px 4px 0 rgba(0, 0, 0, 0.02),
    0 8px 24px -4px rgba(0, 0, 0, 0.06),
    0 2px 6px 0 rgba(0, 0, 0, 0.03)
  `,
};

const emeraldBtnStyle = {
  background: 'linear-gradient(145deg, #10B981 0%, #059669 100%)',
  boxShadow: `
    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
    inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
    0 4px 12px -2px rgba(16, 185, 129, 0.4),
    0 1px 3px 0 rgba(0, 0, 0, 0.08)
  `,
};

const emeraldBtnCls =
  'h-9.5 md:h-10 px-5 md:px-6 text-xs md:text-sm font-bold font-manrope text-white border border-white/35 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 rounded-full! shrink-0 active:scale-97';

export function SecuritySection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profileData } = useQuery({
    queryKey: ['account-profile'],
    queryFn: () => accountApi.getProfile(),
  });

  const hasPassword = profileData?.data?.hasPassword ?? false;

  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [setNewPwd, setSetNewPwd] = useState('');
  const [setConfirmPwd, setSetConfirmPwd] = useState('');
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !emailCurrentPassword) return;

    try {
      setIsUpdatingEmail(true);
      await accountApi.changeEmail({ newEmail, currentPassword: emailCurrentPassword });
      toast.success('Email changed successfully. Please check your new inbox.');
      setNewEmail('');
      setEmailCurrentPassword('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to change email.';
      toast.error(msg);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return;

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await accountApi.changePassword({ currentPassword, newPassword, confirmPassword });
      toast.success('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to change password.';
      toast.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setNewPwd || !setConfirmPwd) return;

    if (setNewPwd !== setConfirmPwd) {
      toast.error('Passwords do not match.');
      return;
    }

    if (setNewPwd.length < 10) {
      toast.error('Password must be at least 10 characters.');
      return;
    }

    try {
      setIsSettingPassword(true);
      await accountApi.setPassword({ newPassword: setNewPwd, confirmPassword: setConfirmPwd });
      toast.success('Password set successfully! You can now sign in with email and password.');
      setSetNewPwd('');
      setSetConfirmPwd('');
      queryClient.invalidateQueries({ queryKey: ['account-profile'] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to set password.';
      toast.error(msg);
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-manrope select-none">
      <div
        className="relative rounded-3xl overflow-hidden border border-slate-200/80 font-manrope"
        style={cardStyle}
      >
        <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white via-white/50 to-transparent pointer-events-none" />
        <div className="text-neutral-900 p-4.5 md:p-6 space-y-4 md:space-y-5">
          <div>
            <h3 className="text-lg md:text-xl font-bold tracking-normal text-neutral-900 font-syne">
              Email Address
            </h3>
            <p className="text-xs text-slate-500 font-manrope mt-0.5">
              Current email:{' '}
              <span className="font-semibold text-neutral-900">{user?.email || 'N/A'}</span>
            </p>
          </div>

          {hasPassword ? (
            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newEmail" className={labelCls}>
                    New Email Address
                  </Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="new@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={isUpdatingEmail}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="emailCurrentPassword" className={labelCls}>
                    Current Password
                  </Label>
                  <Input
                    id="emailCurrentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={emailCurrentPassword}
                    onChange={(e) => setEmailCurrentPassword(e.target.value)}
                    disabled={isUpdatingEmail}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <Button
                  type="submit"
                  variant="waterdrop"
                  disabled={isUpdatingEmail || !newEmail || !emailCurrentPassword}
                  className={emeraldBtnCls}
                  style={emeraldBtnStyle}
                >
                  <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                    {isUpdatingEmail ? 'Updating...' : 'Update Email'}
                  </span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-3.5 md:p-4">
              <p className="text-xs md:text-sm text-amber-800 font-medium font-manrope leading-relaxed">
                You signed in with Google and don't have a password set yet. Please set a password
                below before you can change your email address.
              </p>
            </div>
          )}
        </div>
      </div>

      <div
        className="relative rounded-3xl overflow-hidden border border-slate-200/80 font-manrope"
        style={cardStyle}
      >
        <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white via-white/50 to-transparent pointer-events-none" />
        <div className="text-neutral-900 p-4.5 md:p-6 space-y-4 md:space-y-5">
          <div>
            <h3 className="text-lg md:text-xl font-bold tracking-normal text-neutral-900 font-syne">
              {hasPassword ? 'Change Password' : 'Set Password'}
            </h3>
            <p className="text-xs text-slate-500 font-manrope mt-0.5">
              {hasPassword
                ? 'Update your account password to maintain maximum security.'
                : 'Set a password to enable email and password login alongside your Google account.'}
            </p>
          </div>

          {hasPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className={labelCls}>
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isUpdatingPassword}
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className={labelCls}>
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className={labelCls}>
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isUpdatingPassword}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <Button
                  type="submit"
                  variant="waterdrop"
                  disabled={
                    isUpdatingPassword || !currentPassword || !newPassword || !confirmPassword
                  }
                  className={emeraldBtnCls}
                  style={emeraldBtnStyle}
                >
                  <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </span>
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="setNewPassword" className={labelCls}>
                    New Password
                  </Label>
                  <Input
                    id="setNewPassword"
                    type="password"
                    placeholder="Min. 10 characters"
                    value={setNewPwd}
                    onChange={(e) => setSetNewPwd(e.target.value)}
                    disabled={isSettingPassword}
                    className={inputCls}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="setConfirmPassword" className={labelCls}>
                    Confirm Password
                  </Label>
                  <Input
                    id="setConfirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={setConfirmPwd}
                    onChange={(e) => setSetConfirmPwd(e.target.value)}
                    disabled={isSettingPassword}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <Button
                  type="submit"
                  variant="waterdrop"
                  disabled={isSettingPassword || !setNewPwd || !setConfirmPwd}
                  className={emeraldBtnCls}
                  style={emeraldBtnStyle}
                >
                  <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                    {isSettingPassword ? 'Setting...' : 'Set Password'}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
