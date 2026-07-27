import { formatImageUrl } from '@/lib/utils';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { updateUser } from '@/lib/auth-client';
import { accountApi } from '@/lib/api-client';
import { toast } from 'sonner';
import { HugeiconsIcon } from '@hugeicons/react';
import { User03Icon, Upload01Icon, Mail01Icon } from '@hugeicons/core-free-icons';

export function ProfileSection() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsUpdating(true);
      await accountApi.updateProfile({ name });
      try {
        await updateUser({ name });
      } catch (e) {
        console.error('Failed to update session name:', e);
      }
      toast.success('Profile updated successfully.');
      window.location.reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB.');
      return;
    }

    try {
      setIsUploading(true);
      const { data } = await accountApi.getPhotoUrl({
        fileName: file.name,
        fileType: file.type,
        sizeBytes: file.size,
      });

      const photoUrlData = data as unknown as {
        uploadUrl?: string;
        url?: string;
        storageKey?: string;
        key?: string;
      };
      const uploadUrl = photoUrlData.uploadUrl || photoUrlData.url;
      const storageKey = photoUrlData.storageKey || photoUrlData.key;

      if (!uploadUrl || !storageKey) {
        throw new Error('Failed to obtain presigned upload URL.');
      }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload image to storage.');
      }

      const confirmRes = await accountApi.confirmPhoto({ storageKey });
      const confirmData = confirmRes as unknown as {
        data?: { image?: string };
        image?: string;
      };
      const newImageUrl = confirmData?.data?.image || confirmData?.image;

      try {
        await updateUser({
          image: newImageUrl || storageKey,
        });
      } catch (e) {
        console.error('Failed to update session image:', e);
      }

      toast.success('Profile photo updated.');
      window.location.reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update profile photo.';
      toast.error(msg);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const avatarSrc = formatImageUrl(user?.image);

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden border border-white/35 font-manrope select-none"
      style={{
        background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
        boxShadow: `
          inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
          inset 0 -2px 4px 0 rgba(0, 0, 0, 0.25),
          0 6px 16px -2px rgba(16, 185, 129, 0.45),
          0 3px 6px 0 rgba(0, 0, 0, 0.12)
        `,
      }}
    >
      <div className="absolute inset-x-4 top-0.5 h-2 rounded-t-full bg-linear-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />

      <div className="text-white p-3.5 md:p-5 space-y-3 md:space-y-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg md:text-xl font-bold tracking-normal text-white font-syne">
              Profile
            </h3>
            <p className="text-xs text-white/80 font-manrope">
              Manage your avatar and display name for trip workspaces.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-2 md:p-2.5 rounded-[20px] bg-black/10 backdrop-blur-md border border-white/20 shadow-xs">
          <div className="shrink-0">
            <Avatar className="h-20 w-20 md:h-22 md:w-22 rounded-[16px] border-2 border-white/60 shadow-lg ring-1 ring-white/30 overflow-hidden bg-black/20">
              <AvatarImage
                src={avatarSrc}
                alt={user?.name}
                className="object-cover w-full h-full rounded-2xl"
              />
              <AvatarFallback className="bg-white/20 backdrop-blur-md text-white flex items-center justify-center rounded-2xl">
                <HugeiconsIcon
                  icon={User03Icon}
                  className="size-9 text-white/90"
                  strokeWidth={1.8}
                />
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2.5">
              <Button
                type="button"
                variant="waterdrop"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="h-8.5 px-3.5 text-xs font-semibold font-manrope text-emerald-950 border border-white/90 cursor-pointer transition-all active:scale-97"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
                  boxShadow: `
                    inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                    inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.08),
                    0 3px 10px -2px rgba(0, 0, 0, 0.15)
                  `,
                }}
              >
                <HugeiconsIcon
                  icon={Upload01Icon}
                  className="size-3.5 text-emerald-700 mr-1.5"
                  strokeWidth={2.2}
                />
                {isUploading ? 'Uploading...' : 'Upload Photo'}
              </Button>
            </div>
            <p className="text-[11px] text-white/70 font-manrope">
              JPG, PNG or WebP. Max size 5MB.
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="name"
                className="text-xs font-semibold font-syne text-white/90 flex items-center gap-1.5"
              >
                <HugeiconsIcon
                  icon={User03Icon}
                  className="size-3.5 text-white/80"
                  strokeWidth={2}
                />
                Display Name
              </Label>
              <Input
                id="name"
                placeholder="Enter display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isUpdating}
                className="h-10.5 rounded-xl border border-white/25 bg-black/15 text-white placeholder:text-white/40 text-xs md:text-sm font-medium focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:border-white/60 transition-all shadow-inner font-manrope"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold font-syne text-white/90 flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={Mail01Icon}
                  className="size-3.5 text-white/70"
                  strokeWidth={2}
                />
                Email Address
              </Label>
              <Input
                value={user?.email || ''}
                disabled
                className="h-10.5 rounded-xl border border-white/15 bg-black/25 text-white/60 text-xs md:text-sm font-medium font-manrope cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="waterdrop"
              disabled={isUpdating || name.trim() === user?.name}
              className="h-10 px-5 text-sm font-bold font-manrope text-emerald-950 border border-white/90 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-97"
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F3F4F6 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.08),
                  0 4px 12px -2px rgba(0, 0, 0, 0.15)
                `,
              }}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
