import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const initSocket = (token: string, tripId: string): Socket => {
  if (socketInstance) {
    socketInstance.disconnect();
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const url = apiUrl.replace('/api', '');

  socketInstance = io(url, {
    auth: {
      token,
    },
    transports: ['websocket'],
    autoConnect: false,
  });

  socketInstance.connect();

  socketInstance.on('connect', () => {
    socketInstance?.emit('trip:join', tripId);
  });

  return socketInstance;
};

export const getSocket = (): Socket | null => {
  return socketInstance;
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
