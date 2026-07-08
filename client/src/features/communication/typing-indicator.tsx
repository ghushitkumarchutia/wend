import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/components/providers/socket-provider';

interface TypingIndicatorProps {
  tripId: string;
}

export function TypingIndicator({ tripId }: TypingIndicatorProps) {
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const timeoutMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: {
      tripId: string;
      userId: string;
      userName: string;
      isTyping: boolean;
    }) => {
      if (data.tripId !== tripId) return;

      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (data.isTyping) {
          next.add(data.userName);

          // Auto clear after 3s to prevent stuck typing indicators
          if (timeoutMap.current.has(data.userId)) {
            clearTimeout(timeoutMap.current.get(data.userId));
          }
          const timeout = setTimeout(() => {
            setTypingUsers((current) => {
              const updated = new Set(current);
              updated.delete(data.userName);
              return updated;
            });
          }, 3000);
          timeoutMap.current.set(data.userId, timeout);
        } else {
          next.delete(data.userName);
          if (timeoutMap.current.has(data.userId)) {
            clearTimeout(timeoutMap.current.get(data.userId));
            timeoutMap.current.delete(data.userId);
          }
        }
        return next;
      });
    };

    socket.on('chat:user:typing', handleTyping);

    return () => {
      socket.off('chat:user:typing', handleTyping);
      const timeouts = timeoutMap.current;
      timeouts.forEach(clearTimeout);
      timeouts.clear();
    };
  }, [socket, tripId]);

  if (typingUsers.size === 0) return null;

  const usersArray = Array.from(typingUsers);
  let text = 'Several people are typing...';

  if (usersArray.length === 1) {
    text = `${usersArray[0]} is typing...`;
  } else if (usersArray.length === 2) {
    text = `${usersArray[0]} and ${usersArray[1]} are typing...`;
  }

  return (
    <div className="text-xs text-muted-foreground italic px-4 py-1 h-6 flex items-center">
      {text}
    </div>
  );
}
