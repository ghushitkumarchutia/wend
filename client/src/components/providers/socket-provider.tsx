import { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, disconnectSocket } from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function setup() {
      try {
        const res = await fetch('/api/auth/token');
        if (!res.ok) {
          throw new Error('Failed to fetch token');
        }
        const data = await res.json();

        if (!data.token) {
          throw new Error('No JWT token found');
        }

        const token = data.token;

        if (!mounted) return;

        const s = initSocket(token);

        s.on('connect', () => {
          setIsConnected(true);
        });

        s.on('disconnect', () => {
          setIsConnected(false);
        });

        setSocket(s);
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    }

    setup();

    return () => {
      mounted = false;
      disconnectSocket();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>{children}</SocketContext.Provider>
  );
}
