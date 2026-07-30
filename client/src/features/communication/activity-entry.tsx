import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatImageUrl } from '@/lib/utils';
import type { ActivityEntry } from '@/types/models';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Luggage02Icon,
  User02Icon,
  Delete01Icon,
  UserQuestion02Icon,
  File01Icon,
  FileAddIcon,
  Agreement02Icon,
  Calendar04Icon,
  CalendarAdd01Icon,
  Chart01Icon,
  Cancel02Icon,
  Notification03Icon,
} from '@hugeicons/core-free-icons';

interface ActivityEntryItemProps {
  activity: ActivityEntry;
}

interface ActivityTheme {
  icon: typeof Luggage02Icon;
  iconColor: string;
  gradient: string;
  borderColor: string;
  shadowColor: string;
  textColor: string;
  subtextColor: string;
}

export function ActivityEntryItem({ activity }: ActivityEntryItemProps) {
  const getTheme = (): ActivityTheme => {
    switch (activity.type) {
      case 'trip_created':
        return {
          icon: Luggage02Icon,
          iconColor: 'text-blue-600',
          gradient: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
          borderColor: 'border-blue-200/90',
          shadowColor: 'rgba(37, 99, 235, 0.16)',
          textColor: 'text-blue-950',
          subtextColor: 'text-blue-700/80',
        };
      case 'member_joined':
        return {
          icon: User02Icon,
          iconColor: 'text-emerald-600',
          gradient: 'linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)',
          borderColor: 'border-emerald-200/90',
          shadowColor: 'rgba(16, 185, 129, 0.16)',
          textColor: 'text-emerald-950',
          subtextColor: 'text-emerald-700/80',
        };
      case 'member_left':
        return {
          icon: User02Icon,
          iconColor: 'text-slate-600',
          gradient: 'linear-gradient(145deg, #F8FAFC 0%, #E2E8F0 100%)',
          borderColor: 'border-slate-300/90',
          shadowColor: 'rgba(71, 85, 105, 0.14)',
          textColor: 'text-slate-950',
          subtextColor: 'text-slate-600',
        };
      case 'member_removed':
        return {
          icon: Delete01Icon,
          iconColor: 'text-red-600',
          gradient: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
          borderColor: 'border-red-200/90',
          shadowColor: 'rgba(239, 68, 68, 0.18)',
          textColor: 'text-red-950',
          subtextColor: 'text-red-700/80',
        };
      case 'role_changed':
        return {
          icon: UserQuestion02Icon,
          iconColor: 'text-amber-600',
          gradient: 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)',
          borderColor: 'border-amber-200/90',
          shadowColor: 'rgba(217, 119, 6, 0.16)',
          textColor: 'text-amber-950',
          subtextColor: 'text-amber-700/80',
        };
      case 'expense_logged':
        return {
          icon: File01Icon,
          iconColor: 'text-teal-600',
          gradient: 'linear-gradient(145deg, #F0FDFA 0%, #CCFBF1 100%)',
          borderColor: 'border-teal-200/90',
          shadowColor: 'rgba(13, 148, 136, 0.16)',
          textColor: 'text-teal-950',
          subtextColor: 'text-teal-700/80',
        };
      case 'expense_updated':
        return {
          icon: FileAddIcon,
          iconColor: 'text-sky-600',
          gradient: 'linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)',
          borderColor: 'border-sky-200/90',
          shadowColor: 'rgba(2, 132, 199, 0.16)',
          textColor: 'text-sky-950',
          subtextColor: 'text-sky-700/80',
        };
      case 'expense_deleted':
        return {
          icon: Delete01Icon,
          iconColor: 'text-red-600',
          gradient: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
          borderColor: 'border-red-200/90',
          shadowColor: 'rgba(239, 68, 68, 0.18)',
          textColor: 'text-red-950',
          subtextColor: 'text-red-700/80',
        };
      case 'settlement_logged':
        return {
          icon: Agreement02Icon,
          iconColor: 'text-green-600',
          gradient: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)',
          borderColor: 'border-green-200/90',
          shadowColor: 'rgba(22, 163, 74, 0.16)',
          textColor: 'text-green-950',
          subtextColor: 'text-green-700/80',
        };
      case 'itinerary_added':
        return {
          icon: Calendar04Icon,
          iconColor: 'text-purple-600',
          gradient: 'linear-gradient(145deg, #FAF5FF 0%, #F3E8FF 100%)',
          borderColor: 'border-purple-200/90',
          shadowColor: 'rgba(147, 51, 234, 0.16)',
          textColor: 'text-purple-950',
          subtextColor: 'text-purple-700/80',
        };
      case 'itinerary_updated':
        return {
          icon: CalendarAdd01Icon,
          iconColor: 'text-fuchsia-600',
          gradient: 'linear-gradient(145deg, #FDF4FF 0%, #FAE8FF 100%)',
          borderColor: 'border-fuchsia-200/90',
          shadowColor: 'rgba(192, 38, 211, 0.16)',
          textColor: 'text-fuchsia-950',
          subtextColor: 'text-fuchsia-700/80',
        };
      case 'itinerary_deleted':
        return {
          icon: Delete01Icon,
          iconColor: 'text-red-600',
          gradient: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
          borderColor: 'border-red-200/90',
          shadowColor: 'rgba(239, 68, 68, 0.18)',
          textColor: 'text-red-950',
          subtextColor: 'text-red-700/80',
        };
      case 'document_uploaded':
        return {
          icon: FileAddIcon,
          iconColor: 'text-indigo-600',
          gradient: 'linear-gradient(145deg, #EEF2FF 0%, #E0E7FF 100%)',
          borderColor: 'border-indigo-200/90',
          shadowColor: 'rgba(79, 70, 229, 0.16)',
          textColor: 'text-indigo-950',
          subtextColor: 'text-indigo-700/80',
        };
      case 'document_deleted':
        return {
          icon: Delete01Icon,
          iconColor: 'text-red-600',
          gradient: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
          borderColor: 'border-red-200/90',
          shadowColor: 'rgba(239, 68, 68, 0.18)',
          textColor: 'text-red-950',
          subtextColor: 'text-red-700/80',
        };
      case 'poll_created':
        return {
          icon: Chart01Icon,
          iconColor: 'text-orange-600',
          gradient: 'linear-gradient(145deg, #FFF7ED 0%, #FFEDD5 100%)',
          borderColor: 'border-orange-200/90',
          shadowColor: 'rgba(234, 88, 12, 0.16)',
          textColor: 'text-orange-950',
          subtextColor: 'text-orange-700/80',
        };
      case 'poll_closed':
        return {
          icon: Cancel02Icon,
          iconColor: 'text-rose-600',
          gradient: 'linear-gradient(145deg, #FFF1F2 0%, #FFE4E6 100%)',
          borderColor: 'border-rose-200/90',
          shadowColor: 'rgba(225, 29, 72, 0.16)',
          textColor: 'text-rose-950',
          subtextColor: 'text-rose-700/80',
        };
      default:
        return {
          icon: Notification03Icon,
          iconColor: 'text-zinc-600',
          gradient: 'linear-gradient(145deg, #FAFAFA 0%, #F4F4F5 100%)',
          borderColor: 'border-zinc-300/90',
          shadowColor: 'rgba(82, 82, 91, 0.14)',
          textColor: 'text-zinc-950',
          subtextColor: 'text-zinc-600',
        };
    }
  };

  const theme = getTheme();

  const getMessage = () => {
    const actor = activity.actor?.name || 'Someone';

    switch (activity.type) {
      case 'trip_created':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> created the trip.
          </span>
        );
      case 'member_joined':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> joined the trip.
          </span>
        );
      case 'member_left':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> left the trip.
          </span>
        );
      case 'member_removed':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> removed a member.
          </span>
        );
      case 'role_changed':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> changed member role.
          </span>
        );
      case 'expense_logged':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> added an expense.
          </span>
        );
      case 'expense_updated':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> updated an expense.
          </span>
        );
      case 'expense_deleted':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> deleted an expense.
          </span>
        );
      case 'settlement_logged':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> recorded a settlement.
          </span>
        );
      case 'itinerary_added':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> added a new itinerary event.
          </span>
        );
      case 'itinerary_updated':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> updated an itinerary event.
          </span>
        );
      case 'itinerary_deleted':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> deleted an itinerary event.
          </span>
        );
      case 'document_uploaded':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> uploaded a document.
          </span>
        );
      case 'document_deleted':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> deleted a document.
          </span>
        );
      case 'poll_created':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> created a poll.
          </span>
        );
      case 'poll_closed':
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> closed a poll.
          </span>
        );
      default:
        return (
          <span>
            <span className="font-bold font-syne">{actor}</span> performed an action (
            {activity.type.replace(/_/g, ' ')}).
          </span>
        );
    }
  };

  const initials =
    activity.actor?.name
      ?.split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U';

  const avatarImage = formatImageUrl(activity.actor?.image);

  const formattedTime = activity.createdAt
    ? formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })
    : '';

  return (
    <div
      className={`relative rounded-2xl md:rounded-[22px] overflow-hidden ${theme.borderColor} border p-3.5 md:p-4 font-manrope transition-all duration-200 my-2.5 shadow-xs`}
      style={{
        background: theme.gradient,
        boxShadow: `
          inset 0 1.5px 2px 0 #FFFFFF,
          inset 0 -2px 4px 0 rgba(0, 0, 0, 0.05),
          0 4px 14px -2px ${theme.shadowColor},
          0 2px 4px 0 rgba(0, 0, 0, 0.02)
        `,
      }}
    >
      <div className="absolute inset-x-4 top-0.5 h-1.5 rounded-t-full bg-linear-to-b from-white/50 via-white/10 to-transparent pointer-events-none" />
      <div className="flex gap-3 md:gap-3.5 items-center relative z-10">
        <div className="shrink-0 relative">
          <div
            className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-[14px] md:rounded-[16px] border border-white/80 shadow-xs"
            style={{
              background: 'linear-gradient(145deg, #FFFFFF 0%, rgba(255,255,255,0.7) 100%)',
              boxShadow: 'inset 0 1px 2px 0 #FFFFFF, 0 2px 6px rgba(0,0,0,0.06)',
            }}
          >
            <HugeiconsIcon
              icon={theme.icon}
              size={22}
              className={`${theme.iconColor} md:w-6 md:h-6`}
            />
          </div>
          <Avatar className="w-4.5 h-4.5 md:w-5 md:h-5 absolute -bottom-1 -right-1 border-2 border-white shadow-xs ring-1 ring-black/5 overflow-hidden">
            <AvatarImage src={avatarImage || undefined} />
            <AvatarFallback className="text-[9px] font-bold bg-emerald-100 text-emerald-800">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p
            className={`text-xs md:text-sm wrap-break-word leading-snug font-manrope ${theme.textColor}`}
          >
            {getMessage()}
          </p>
          <p
            className={`text-[11px] md:text-xs mt-1 font-medium font-manrope ${theme.subtextColor}`}
          >
            {formattedTime}
          </p>
        </div>
      </div>
    </div>
  );
}
