import { io, type Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

async function fetchAuthToken(): Promise<string> {
  const response = await fetch(`${SOCKET_URL}/api/auth/token`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to retrieve auth token for socket connection');
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

export async function connectSocket(): Promise<Socket> {
  if (socket?.connected) {
    return socket;
  }

  const token = await fetchAuthToken();

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
