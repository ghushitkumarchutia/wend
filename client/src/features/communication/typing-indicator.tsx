import { useEffect, useState, useRef } from 'react';
import { useSocket } from '@/components/providers/socket-provider';
import { useAuth } from '@/hooks/use-auth';

interface TypingIndicatorProps {
  tripId: string;
}

export function TypingIndicator({ tripId }: TypingIndicatorProps) {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [typingUsers, setTypingUsers] = useState<Map<string, string>>(new Map());
  const timeoutMap = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!socket) return;
    const currentTimeoutMap = timeoutMap.current;

    const handleTyping = (data: {
      tripId?: string;
      userId: string;
      userName: string;
      isTyping?: boolean;
    }) => {
      if (data.tripId && data.tripId !== tripId) return;
      if (user && data.userId === user.id) return;

      setTypingUsers((prev) => {
        const next = new Map(prev);

        if (data.isTyping !== false) {
          next.set(data.userId, data.userName);

          if (currentTimeoutMap.has(data.userId)) {
            clearTimeout(currentTimeoutMap.get(data.userId));
          }
          const timeout = setTimeout(() => {
            setTypingUsers((current) => {
              const updated = new Map(current);
              updated.delete(data.userId);
              return updated;
            });
          }, 3000);
          currentTimeoutMap.set(data.userId, timeout);
        } else {
          next.delete(data.userId);
          if (currentTimeoutMap.has(data.userId)) {
            clearTimeout(currentTimeoutMap.get(data.userId));
            currentTimeoutMap.delete(data.userId);
          }
        }
        return next;
      });
    };

    socket.on('chat:user:typing', handleTyping);

    return () => {
      socket.off('chat:user:typing', handleTyping);
      currentTimeoutMap.forEach(clearTimeout);
      currentTimeoutMap.clear();
    };
  }, [socket, tripId, user]);

  if (typingUsers.size === 0) return null;

  const names = Array.from(typingUsers.values());
  const firstName = names[0] || 'User';
  const initials = firstName.slice(0, 2).toUpperCase();

  let labelText = `${firstName} is typing...`;
  if (names.length === 2) {
    labelText = `${names[0]} and ${names[1]} are typing...`;
  } else if (names.length > 2) {
    labelText = 'Several people are typing...';
  }

  return (
    <div className="flex gap-2.5 w-full items-start font-manrope select-none animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="w-8 h-8 rounded-full border-2 border-white shadow-xs shrink-0 mt-0.5 ring-1 ring-black/5 overflow-hidden bg-white">
        <div className="w-full h-full bg-emerald-100 text-emerald-800 font-syne font-bold text-[11px] flex items-center justify-center">
          {initials}
        </div>
      </div>

      <div className="flex flex-col items-start max-w-[75%]">
        <div className="flex items-baseline gap-1.5 mb-0.5 translate-y-0.5 px-0.5">
          <span className="text-xs font-bold font-syne text-emerald-700">
            {labelText}
          </span>
        </div>
        <div
          className="h-8 px-3.5 md:px-4 rounded-[18px] rounded-tl-sm border border-emerald-200/60 flex items-center justify-center gap-1.5"
          style={{
            background: 'linear-gradient(145deg, #F0FDF4 0%, #ECFDF5 100%)',
            boxShadow: `
              inset 0 1.5px 2px 0 #FFFFFF,
              0 3px 12px -2px rgba(16, 185, 129, 0.08),
              0 1px 2px 0 rgba(0, 0, 0, 0.02)
            `,
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"
            style={{
              animation: 'typingDotWave 1.2s infinite ease-in-out',
              animationDelay: '0s',
            }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"
            style={{
              animation: 'typingDotWave 1.2s infinite ease-in-out',
              animationDelay: '0.2s',
            }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block animate-pulse"
            style={{
              animation: 'typingDotWave 1.2s infinite ease-in-out',
              animationDelay: '0.4s',
            }}
          />
        </div>
        <style>{`
          @keyframes typingDotWave {
            0%, 60%, 100% {
              transform: translateY(0);
              opacity: 0.5;
            }
            30% {
              transform: translateY(-3px);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
