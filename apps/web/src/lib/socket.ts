import { io, Socket } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class SocketSingleton {
  private static instance: Socket | null = null

  public static getInstance(): Socket {
    if (!SocketSingleton.instance) {
      SocketSingleton.instance = io(SOCKET_URL, {
        autoConnect: false,
        withCredentials: true,
      })
    }
    return SocketSingleton.instance
  }
}

export const getSocket = () => SocketSingleton.getInstance()
