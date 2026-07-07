import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

import { Worker } from 'bullmq';
import { workerRedisUrl } from './redis.js';
import { processEmailJob } from './processors/email.js';
import { processNotificationJob } from './processors/notifications.js';
import { processReminderJob } from './processors/reminders.js';

const connection = { url: workerRedisUrl };

const emailWorker = new Worker('email', processEmailJob, {
  connection,
  concurrency: 5,
});

const notificationsWorker = new Worker('notifications', processNotificationJob, {
  connection,
  concurrency: 5,
});

const remindersWorker = new Worker('reminders', processReminderJob, {
  connection,
  concurrency: 3,
});

console.log('Worker started — listening on queues: email, notifications, reminders');

async function gracefulShutdown(signal: string) {
  console.log(`${signal} received — shutting down workers`);
  await Promise.all([
    emailWorker.close(),
    notificationsWorker.close(),
    remindersWorker.close(),
  ]);
  process.exit(0);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
