import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/lib/api-client';
import { useSocket } from '@/components/providers/socket-provider';
import { useAuth } from '@/hooks/use-auth';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { TypingIndicator } from './typing-indicator';
import type { ChatMessage } from '@/types/models';
import type { ChatMessageListResponse } from '@/types/api';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MessageMultiple01Icon,
  Loading02Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';

interface ChatTabProps {
  tripId: string;
}

export function ChatTab({ tripId }: ChatTabProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['chat', tripId],
    queryFn: () => chatApi.getMessages(tripId),
  });

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior,
        });
      }
    });
  };

  useEffect(() => {
    if (data?.data?.messages) {
      scrollToBottom('instant');
    }
  }, [data?.data?.messages]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('trip:join', tripId);

    const handleNewMessage = (msg: ChatMessage) => {
      queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
        if (!oldData) return oldData;
        const msgs = oldData.data.messages;
        if (msgs.find((m: ChatMessage) => m.id === msg.id)) return oldData;

        const filteredMsgs = msgs.filter(
          (m: ChatMessage) =>
            !(m.id.startsWith('temp-') && m.userId === msg.userId && m.body === msg.body),
        );

        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: [...filteredMsgs, msg],
          },
        };
      });
      scrollToBottom('smooth');
    };

    const handleEditMessage = (msg: ChatMessage) => {
      queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: oldData.data.messages.map((m: ChatMessage) =>
              m.id === msg.id ? { ...m, body: msg.body, editedAt: msg.editedAt } : m,
            ),
          },
        };
      });
    };

    const handleDeleteMessage = ({ messageId }: { messageId: string }) => {
      queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: oldData.data.messages.filter((m: ChatMessage) => m.id !== messageId),
          },
        };
      });
    };

    socket.on('chat:message:new', handleNewMessage);
    socket.on('chat:message:edited', handleEditMessage);
    socket.on('chat:message:deleted', handleDeleteMessage);

    return () => {
      socket.off('chat:message:new', handleNewMessage);
      socket.off('chat:message:edited', handleEditMessage);
      socket.off('chat:message:deleted', handleDeleteMessage);
    };
  }, [socket, tripId, queryClient]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-neutral-400 font-manrope text-xs font-medium select-none space-y-2">
        <HugeiconsIcon
          icon={Loading02Icon}
          className="w-6 h-6 md:w-7 md:h-7 text-emerald-600 animate-spin"
        />
        <span className="text-xs text-neutral-500 font-medium">Loading messages...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center font-manrope select-none space-y-2">
        <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200/80 flex items-center justify-center">
          <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-rose-600" />
        </div>
        <p className="text-xs md:text-sm font-semibold text-rose-600">Failed to load chat</p>
      </div>
    );
  }

  const rawMessages = data.data?.messages ?? [];
  const messages = [...rawMessages].sort(
    (a: ChatMessage, b: ChatMessage) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col h-full absolute inset-0 font-manrope">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2.5 md:space-y-3 flex flex-col custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center mb-3 shadow-2xs">
              <HugeiconsIcon
                icon={MessageMultiple01Icon}
                className="w-5 h-5 md:w-6 md:h-6 text-emerald-600"
                strokeWidth={1.8}
              />
            </div>
            <h3 className="text-sm md:text-base font-bold font-syne text-neutral-900 tracking-tight">
              Welcome to the trip chat!
            </h3>
            <p className="text-[11px] md:text-xs font-medium font-manrope text-neutral-500 mt-1 max-w-xs">
              Say hello to start the conversation with trip members.
            </p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.userId === user?.id}
              tripId={tripId}
            />
          ))
        )}
        <TypingIndicator tripId={tripId} />
      </div>

      <div className="mt-auto">
        <ChatInput tripId={tripId} />
      </div>
    </div>
  );
}
