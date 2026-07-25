import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon } from '@hugeicons/core-free-icons';
import { travelersApi } from '@/lib/api-client';
import { toast } from 'sonner';
import type { TripMemberRole } from '@/types/models';

interface InviteMembersPanelProps {
  tripId: string;
}

const labelClass =
  'text-[10px] md:text-[11px] font-bold text-neutral-600 tracking-wider font-syne select-none uppercase ml-1 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]';

const inputClass =
  'relative z-10 w-full bg-transparent border-none focus-visible:ring-0! focus-visible:outline-none! focus-visible:border-transparent h-10.5! px-3.5 text-xs md:text-sm font-manrope font-semibold text-neutral-900 placeholder:text-slate-400 placeholder:font-normal transition-all duration-300';

const inputContainerStyle = {
  background: '#FFFFFF',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(2, 132, 199, 0.25)',
};

export function InviteMembersPanel({ tripId }: InviteMembersPanelProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<TripMemberRole>('member');
  const [name, setName] = useState('');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSubmitting(true);
      await travelersApi.sendInvite(tripId, { email, role, name: name || undefined });
      toast.success('Invite sent successfully!');
      setEmail('');
      setName('');
      setRole('member');
      queryClient.invalidateQueries({ queryKey: ['trip-invites', tripId] });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to send invite.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full rounded-3xl p-1 bg-white shadow-2xs flex flex-col justify-start select-none font-manrope">
      <div
        className="w-full rounded-2xl px-4.5 md:px-5 pt-4 md:pt-5 pb-5 md:pb-6 flex flex-col justify-start transition-colors"
        style={{
          background: 'linear-gradient(to top, #BAE6FD 0%, #FFFFFF 100%)',
        }}
      >
        <div className="pb-4">
          <h3 className="text-lg md:text-xl font-semibold tracking-wide text-neutral-900 font-syne">
            Invite Travelers
          </h3>
          <p className="text-[11px] md:text-xs text-neutral-500 font-manrope mt-0.5">
            Send an email invitation to add someone to this trip.
          </p>
        </div>

        <form onSubmit={handleInvite} className="grid gap-3.5 relative z-10">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-email" className={labelClass}>
              Email Address *
            </Label>
            <div
              className="relative w-full rounded-[13px] overflow-hidden flex items-center transition-shadow focus-within:ring-2 focus-within:ring-[#0284C7]/20"
              style={inputContainerStyle}
            >
              <Input
                id="invite-email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-name" className={labelClass}>
              Name (Optional)
            </Label>
            <div
              className="relative w-full rounded-[13px] overflow-hidden flex items-center transition-shadow focus-within:ring-2 focus-within:ring-[#0284C7]/20"
              style={inputContainerStyle}
            >
              <Input
                id="invite-name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="invite-role" className={labelClass}>
              Role
            </Label>
            <Select
              value={role}
              onValueChange={(val) => val && setRole(val as TripMemberRole)}
              disabled={isSubmitting}
            >
              <div
                className="relative w-full rounded-[13px] overflow-hidden flex items-center transition-shadow focus-within:ring-2 focus-within:ring-[#0284C7]/20"
                style={inputContainerStyle}
              >
                <SelectTrigger
                  id="invite-role"
                  className={`${inputClass} cursor-pointer! flex items-center justify-between capitalize [&_svg]:text-neutral-500!`}
                >
                  <SelectValue />
                </SelectTrigger>
              </div>
              <SelectContent
                side="bottom"
                sideOffset={8}
                align="start"
                alignItemWithTrigger={false}
                className="w-full min-w-(--radix-select-trigger-width) bg-white/95 backdrop-blur-md border border-black/5 rounded-[17px] shadow-2xl p-2 overflow-hidden ring-transparent z-50 mt-1"
              >
                {[
                  { label: 'Organizer', value: 'organizer' },
                  { label: 'Member', value: 'member' },
                  { label: 'Viewer', value: 'viewer' },
                ].map((r) => {
                  const isSelected = r.value === role;
                  return (
                    <SelectItem
                      key={r.value}
                      value={r.value}
                      className={`rounded-[11px] transition-all cursor-pointer py-2.25! px-3.5! pr-9! my-0.5 capitalize font-manrope text-sm font-medium ${
                        isSelected
                          ? 'text-[#0284C7]! hover:text-[#0284C7]! focus:text-[#0284C7]! focus:bg-sky-50! hover:bg-sky-50! font-bold border border-sky-200/50'
                          : 'hover:bg-slate-50! focus:bg-slate-50! hover:text-[#0284C7]! focus:text-[#0284C7]! text-neutral-600'
                      }`}
                      style={
                        isSelected
                          ? {
                              background:
                                'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, #E0F2FE 100%)',
                              boxShadow: `
                                inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.95),
                                inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.05),
                                0 2px 8px -2px rgba(2, 132, 199, 0.2)
                              `,
                            }
                          : undefined
                      }
                    >
                      {r.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 md:pt-2.5">
            <Button
              type="submit"
              variant="waterdrop"
              disabled={isSubmitting || !email.trim()}
              className="w-full h-10.5 text-xs md:text-sm font-bold font-manrope text-white border border-white/35 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 rounded-full! shrink-0"
              style={{
                background: 'linear-gradient(145deg, #0EA5E9 0%, #0284C7 100%)',
                boxShadow: `
                  inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                  inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                  0 4px 12px -2px rgba(2, 132, 199, 0.4),
                  0 1px 3px 0 rgba(0, 0, 0, 0.08)
                `,
              }}
            >
              <HugeiconsIcon
                icon={Mail01Icon}
                className="w-4 h-4 md:w-4.5 md:h-4.5 text-white"
                strokeWidth={2.5}
              />
              <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]">
                {isSubmitting ? 'Sending...' : 'Send Invite'}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
