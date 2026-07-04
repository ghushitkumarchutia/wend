import { Queue } from 'bullmq';
import { env } from './env.js';

const connectionUrl = env.REDIS_URL;

export const emailQueue = new Queue('email', {
  connection: { url: connectionUrl },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 30_000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export const notificationsQueue = new Queue('notifications', {
  connection: { url: connectionUrl },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5_000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

export const remindersQueue = new Queue('reminders', {
  connection: { url: connectionUrl },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 10_000,
    },
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});
