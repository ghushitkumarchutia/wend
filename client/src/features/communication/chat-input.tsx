import { useState, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon, Loading02Icon } from '@hugeicons/core-free-icons';
import { Button } from '@/components/ui/button';
import { chatApi } from '@/lib/api-client';
import { useSocket } from '@/components/providers/socket-provider';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type { ChatMessageListResponse } from '@/types/api';
import type { ChatMessage } from '@/types/models';

interface ChatInputProps {
  tripId: string;
}

export function ChatInput({ tripId }: ChatInputProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if (socket) {
      socket.emit('chat:typing:start', { tripId, userName: user?.name });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('chat:typing:stop', { tripId, userName: user?.name });
      }, 2000);
    }
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setMessage('');
    if (socket) socket.emit('chat:typing:stop', { tripId, userName: user?.name });

    const tempId = `temp-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      tripId,
      userId: user?.id || '',
      body: trimmed,
      editedAt: null,
      deletedAt: null,
      createdAt: new Date().toISOString(),
      userName: user?.name || 'You',
      userImage: user?.image || null,
      user: {
        id: user?.id || '',
        name: user?.name || null,
        email: user?.email || '',
        image: user?.image || null,
      },
    };

    queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        data: {
          ...oldData.data,
          messages: [...oldData.data.messages, tempMsg as ChatMessage],
        },
      };
    });

    try {
      setIsSending(true);
      await chatApi.sendMessage(tripId, { body: trimmed });
    } catch {
      toast.error('Failed to send message');
      queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: oldData.data.messages.filter((m: ChatMessage) => m.id !== tempId),
          },
        };
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-2 md:p-2.5 bg-white/85 backdrop-blur-md border-t border-neutral-200/70 font-manrope select-none">
      <div className="relative flex items-end gap-1.5 md:gap-2 bg-[#F5F5F7] hover:bg-[#EEEEEF] focus-within:bg-white border border-neutral-200/80 focus-within:border-emerald-500! focus-within:ring-2! focus-within:ring-emerald-500/20! transition-all duration-200 rounded-xl p-1.5 pl-3 md:pl-3.5 shadow-2xs">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full max-h-30 bg-transparent resize-none outline-none py-1.5 text-xs md:text-sm font-manrope text-neutral-900 placeholder:text-neutral-400 custom-scrollbar font-medium leading-relaxed"
          rows={1}
        />
        <Button
          type="button"
          variant="waterdrop"
          size="icon"
          className="h-8 w-8 md:h-8.5 md:w-8.5 mb-0.5 shrink-0 text-white border border-white/35 rounded-full cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center"
          onClick={handleSend}
          disabled={!message.trim()}
          style={{
            background: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
            boxShadow: `
              inset 0 1.5px 2px 0 rgba(255, 255, 255, 0.45),
              inset 0 -1.5px 3px 0 rgba(0, 0, 0, 0.2),
              0 4px 12px -2px rgba(16, 185, 129, 0.4)
            `,
          }}
        >
          {isSending ? (
            <HugeiconsIcon icon={Loading02Icon} className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin text-white" />
          ) : (
            <HugeiconsIcon icon={SentIcon} className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" strokeWidth={2} />
          )}
        </Button>
      </div>
    </div>
  );
}
