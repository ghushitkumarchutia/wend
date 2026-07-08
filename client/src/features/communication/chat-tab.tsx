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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [data?.data.messages]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: ChatMessage) => {
      queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
        if (!oldData) return oldData;
        const msgs = oldData.data.messages;
        if (msgs.find((m: ChatMessage) => m.id === msg.id)) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: [...msgs, msg],
          },
        };
      });
      // Scroll smoothly to bottom
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTo({
            top: scrollRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 50);
    };

    const handleEditMessage = (msg: ChatMessage) => {
      queryClient.setQueryData(['chat', tripId], (oldData: ChatMessageListResponse | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: {
            ...oldData.data,
            messages: oldData.data.messages.map((m: ChatMessage) => 
              m.id === msg.id ? { ...m, body: msg.body, editedAt: msg.editedAt } : m
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
    return <div className="h-full flex items-center justify-center text-muted-foreground">Loading messages...</div>;
  }

  if (error || !data) {
    return <div className="h-full flex items-center justify-center text-destructive">Failed to load messages</div>;
  }

  const messages = data.data.messages;

  return (
    <div className="flex flex-col h-full absolute inset-0">
      <div 
        ref={scrollRef} 
        className="flex-1 overflow-y-auto p-4 space-y-6 flex flex-col"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-center">
            <p className="font-medium text-foreground">Welcome to the trip chat!</p>
            <p className="text-sm">Say hello to the group.</p>
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
      </div>
      
      <div className="mt-auto">
        <TypingIndicator tripId={tripId} />
        <ChatInput tripId={tripId} />
      </div>
    </div>
  );
}
