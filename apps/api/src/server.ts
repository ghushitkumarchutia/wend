import { createServer } from 'node:http';
import { app } from './app';
import { initSocketServer } from './common/socket';
import { env } from './common/env';

const httpServer = createServer(app);

initSocketServer(httpServer);

httpServer.listen(env.PORT, () => {
  console.log(`API server listening on port ${env.PORT} [${env.NODE_ENV}]`);
});

const shutdown = () => {
  console.log('Shutting down gracefully…');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
