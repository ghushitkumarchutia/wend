import { createServer } from 'node:http';
import { app } from './app.js';
import { initSocketServer } from './common/socket.js';
import { env } from './common/env.js';
import { registerChatHandlers } from './modules/chat/chat.socket.js';

const httpServer = createServer(app);

initSocketServer(httpServer);
registerChatHandlers();

httpServer.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});

function gracefulShutdown(signal: string) {
  console.log(`${signal} received — shutting down`);
  httpServer.close(() => {
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
