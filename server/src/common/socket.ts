import type { Server as HTTPServer } from 'node:http';
import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-streams-adapter';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { redisClient } from './redis.js';
import { env } from './env.js';

let io: Server;

const JWKS = createRemoteJWKSet(new URL(`http://localhost:${env.PORT}/api/auth/jwks`));

export function initSocketServer(httpServer: HTTPServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [env.WEB_ORIGIN, env.ADMIN_ORIGIN],
      credentials: true,
    },
    adapter: createAdapter(redisClient),
    connectionStateRecovery: {},
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const { payload } = await jwtVerify(token, JWKS);
      socket.data.userId = payload.sub;
      socket.data.user = payload;
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
    }
  });

  const subClient = redisClient.duplicate();
  subClient.subscribe('worker:socket:emit');
  subClient.on('message', (channel, message) => {
    if (channel === 'worker:socket:emit') {
      try {
        const { room, event, data } = JSON.parse(message);
        io.to(room).emit(event, data);
      } catch (err) {
        // ignore parsing errors
      }
    }
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.IO not initialized — call initSocketServer first');
  }
  return io;
}
