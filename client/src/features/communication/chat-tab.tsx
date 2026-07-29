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
import { MessageMultiple01Icon } from '@hugeicons/core-free-icons';

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
    if (data?.data.messages) {
      scrollToBottom('instant');
    }
  }, [data?.data.messages]);

  useEffect(() => {
    if (!socket) return;

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
    socket.on('chat:message:edit', handleEditMessage);
    socket.on('chat:message:delete', handleDeleteMessage);

    return () => {
      socket.off('chat:message:new', handleNewMessage);
      socket.off('chat:message:edit', handleEditMessage);
      socket.off('chat:message:delete', handleDeleteMessage);
    };
  }, [socket, tripId, queryClient]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-neutral-400 font-manrope text-xs font-medium select-none">
        <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
        <span>Loading messages...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center text-rose-600 font-manrope text-xs font-semibold select-none">
        Failed to load messages
      </div>
    );
  }

  const messages = [...data.data.messages].sort(
    (a: ChatMessage, b: ChatMessage) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col h-full absolute inset-0 font-manrope">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3.5 md:p-4 space-y-3 flex flex-col custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="w-12 h-12 rounded-xl bg-emerald-100/80 border border-emerald-200/60 flex items-center justify-center mb-3 shadow-2xs">
              <HugeiconsIcon
                icon={MessageMultiple01Icon}
                className="w-6 h-6 text-emerald-600"
                strokeWidth={1.8}
              />
            </div>
            <h3 className="text-base font-bold font-syne text-neutral-900 tracking-tight">
              Welcome to the trip chat!
            </h3>
            <p className="text-xs font-medium font-manrope text-neutral-500 mt-1">
              Say hello to the group.
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
