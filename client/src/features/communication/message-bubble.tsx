import { useState } from 'react';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MoreHorizontalCircle01Icon,
  PencilEdit02Icon,
  Delete01Icon,
  Tick04Icon,
  Cancel02Icon,
} from '@hugeicons/core-free-icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { chatApi } from '@/lib/api-client';
import { formatImageUrl } from '@/lib/utils';
import { toast } from 'sonner';
import type { ChatMessage } from '@/types/models';
import type { ChatMessageListResponse } from '@/types/api';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  tripId: string;
}

export function MessageBubble({ message, isOwn, tripId }: MessageBubbleProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editBody, setEditBody] = useState(message.body);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = async () => {
    if (editBody.trim() === message.body || !editBody.trim()) {
      setIsEditing(false);
      return;
    }

    const previousData = queryClient.getQueryData(['chat', tripId]);
    const newBody = editBody.trim();

    queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          messages: oldData.data.messages.map((m: ChatMessage) =>
            m.id === message.id ? { ...m, body: newBody, editedAt: new Date().toISOString() } : m,
          ),
        },
      };
    });
    setIsEditing(false);

    try {
      setIsSubmitting(true);
      await chatApi.editMessage(tripId, message.id, { body: newBody });
    } catch {
      queryClient.setQueryData(['chat', tripId], previousData);
      toast.error('Failed to edit message');
      setIsEditing(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    const previousData = queryClient.getQueryData(['chat', tripId]);

    queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          messages: oldData.data.messages.filter((m: ChatMessage) => m.id !== message.id),
        },
      };
    });
    setIsDeleteDialogOpen(false);

    try {
      setIsDeleting(true);
      await chatApi.deleteMessage(tripId, message.id);
    } catch {
      queryClient.setQueryData(['chat', tripId], previousData);
      toast.error('Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  const senderName = message.userName || message.user?.name || 'Member';
  const avatarImage = formatImageUrl(message.userImage || message.user?.image);
  const initials =
    senderName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'M';

  return (
    <>
      <div className={`flex gap-2.5 w-full group ${isOwn ? 'flex-row-reverse' : ''}`}>
        <Avatar className="w-8 h-8 shrink-0 mt-0.5 border-2 border-white shadow-xs ring-1 ring-black/5 overflow-hidden">
          <AvatarImage src={avatarImage} alt={senderName} />
          <AvatarFallback className="text-[11px] font-bold font-syne bg-emerald-100 text-emerald-800">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className={`flex flex-col max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
          <div
            className={`flex items-baseline gap-1.5 mb-0.5 translate-y-0.5 ${isOwn ? 'flex-row-reverse' : ''}`}
          >
            <span
              className={`text-xs font-bold font-syne ${isOwn ? 'text-neutral-700' : 'text-emerald-700'}`}
            >
              {isOwn ? 'You' : senderName}
            </span>
            <span className="text-[10px] text-neutral-400 font-manrope">
              {format(new Date(message.createdAt), 'h:mm a')}
            </span>
            {message.editedAt && (
              <span className="text-[10px] text-neutral-400 italic font-manrope">(edited)</span>
            )}
          </div>

          <div className="relative group/bubble flex items-start">
            <div
              className={`px-3.5 py-2 md:px-4 md:py-2 text-[13px] md:text-[13px] font-manrope tracking-wide wrap-break-word relative transition-all duration-150 ${
                isOwn
                  ? 'text-white rounded-[18px] rounded-tr-sm border border-emerald-400/40'
                  : 'text-emerald-950 rounded-[18px] rounded-tl-sm border border-emerald-200/60 hover:border-emerald-300/80'
              }`}
              style={
                isOwn
                  ? {
                      background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
                      boxShadow: `
                        inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
                        inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
                        0 4px 14px -2px rgba(16, 185, 129, 0.35)
                      `,
                    }
                  : {
                      background: 'linear-gradient(145deg, #F0FDF4 0%, #ECFDF5 100%)',
                      boxShadow: `
                        inset 0 1.5px 2px 0 #FFFFFF,
                        0 3px 12px -2px rgba(16, 185, 129, 0.08),
                        0 1px 2px 0 rgba(0, 0, 0, 0.02)
                      `,
                    }
              }
            >
              {isEditing ? (
                <div className="flex items-center gap-2 min-w-50">
                  <input
                    autoFocus
                    className="bg-white/90 text-neutral-900 border border-emerald-300 rounded-lg px-2.5 py-1 text-[13px] md:text-[13px] font-manrope tracking-wide w-full outline-none focus:ring-2 focus:ring-emerald-500/20"
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEdit();
                      if (e.key === 'Escape') {
                        setIsEditing(false);
                        setEditBody(message.body);
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shrink-0 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                    onClick={handleEdit}
                    disabled={isSubmitting}
                    title="Save"
                  >
                    <HugeiconsIcon
                      icon={Tick04Icon}
                      className="w-4 h-4 text-white"
                      strokeWidth={2.5}
                    />
                  </button>
                  <button
                    type="button"
                    className="h-7 w-7 rounded-lg bg-rose-500 hover:bg-rose-600 active:scale-95 text-white flex items-center justify-center shrink-0 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                    onClick={() => {
                      setIsEditing(false);
                      setEditBody(message.body);
                    }}
                    disabled={isSubmitting}
                    title="Cancel"
                  >
                    <HugeiconsIcon
                      icon={Cancel02Icon}
                      className="w-4 h-4 text-white"
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
              )}
            </div>

            {!isEditing && isOwn && (
              <div
                className={`absolute top-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity ${
                  isOwn ? 'right-full mr-1.5' : 'left-full ml-1.5'
                }`}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-black/5 transition-colors focus-visible:outline-none h-6 w-6 p-0 shrink-0 cursor-pointer">
                    <span className="sr-only">Open menu</span>
                    <HugeiconsIcon
                      icon={MoreHorizontalCircle01Icon}
                      className="size-4 block"
                      strokeWidth={1.5}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align={isOwn ? 'end' : 'start'}
                    className="w-auto min-w-0 bg-white/95 backdrop-blur-md border border-black/5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] rounded-full p-1 z-50 flex items-center gap-0.5"
                  >
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      className="rounded-full px-1.5 py-1 text-neutral-600 hover:text-neutral-900 hover:bg-black/5 focus:bg-black/5 focus:text-neutral-900 cursor-pointer transition-colors flex items-center justify-center shrink-0"
                      title="Edit Message"
                    >
                      <HugeiconsIcon
                        icon={PencilEdit02Icon}
                        className="size-4 block"
                        strokeWidth={1.5}
                      />
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="rounded-full px-1.5 py-1 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer transition-colors flex items-center justify-center shrink-0"
                      title="Delete Message"
                    >
                      <HugeiconsIcon
                        icon={Delete01Icon}
                        className="size-4 block"
                        strokeWidth={1.5}
                      />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[92vw] md:max-w-95 rounded-3xl md:rounded-[32px] ring-0 bg-white p-6 md:p-7 border border-black/5 shadow-2xl gap-0 font-manrope"
        >
          <DialogHeader className="text-center flex flex-col items-center justify-center">
            <DialogTitle className="text-lg md:text-xl font-bold text-neutral-900 font-syne text-center tracking-tight">
              Delete Message
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm text-neutral-500 font-manrope text-center leading-relaxed mt-2">
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2.5 md:gap-3 mt-6">
            <Button
              type="button"
              variant="waterdrop"
              disabled={isDeleting}
              onClick={() => setIsDeleteDialogOpen(false)}
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
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 h-10 md:h-11 text-xs md:text-sm font-semibold font-manrope text-white border border-white/35 cursor-pointer"
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
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
