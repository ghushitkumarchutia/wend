import { useEffect, useState, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useSocketStatusStore } from '@/stores/socket-status-store';
import type { Socket } from 'socket.io-client';

async function initSocket(
  setSocket: (s: Socket | null) => void,
  setStatus: (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void,
) {
  setStatus('connecting');
  try {
    const s = await connectSocket();
    setSocket(s);
    s.on('connect', () => setStatus('connected'));
    s.on('disconnect', () => setStatus('disconnected'));
    s.on('connect_error', () => setStatus('error'));
  } catch {
    setStatus('error');
  }
}

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(() => getSocket());
  const { status, setStatus } = useSocketStatusStore();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus('connecting');
      try {
        const s = await connectSocket();
        if (cancelled) return;
        setSocket(s);
        s.on('connect', () => { if (!cancelled) setStatus('connected'); });
        s.on('disconnect', () => { if (!cancelled) setStatus('disconnected'); });
        s.on('connect_error', () => { if (!cancelled) setStatus('error'); });
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      disconnectSocket();
      setSocket(null);
      setStatus('disconnected');
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(async () => {
    await initSocket(setSocket, setStatus);
  }, [setStatus]);

  const disconnect = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setStatus('disconnected');
  }, [setStatus]);

  return {
    socket,
    status,
    connect,
    disconnect,
  };
}
