import { workerConnection } from './redis';
import { processEmailJob } from './processors/email';
import { processNotificationJob } from './processors/notifications';
import { processReminderJob } from './processors/reminders';
import { Worker } from 'bullmq';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@wend/db';

const DATABASE_URL = process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/wend';

const queryClient = postgres(DATABASE_URL);
const db = drizzle(queryClient, { schema });

const emailWorker = new Worker(
  'email',
  async (job) => {
    await processEmailJob(job);
  },
  {
    connection: workerConnection.duplicate() as any,
    concurrency: 5,
  },
);

const notificationsWorker = new Worker(
  'notifications',
  async (job) => {
    await processNotificationJob(job, db);
  },
  {
    connection: workerConnection.duplicate() as any,
    concurrency: 3,
  },
);

const remindersWorker = new Worker(
  'reminders',
  async (job) => {
    await processReminderJob(job, db);
  },
  {
    connection: workerConnection.duplicate() as any,
    concurrency: 2,
  },
);

const workers = [emailWorker, notificationsWorker, remindersWorker];

for (const worker of workers) {
  worker.on('completed', (job) => {
    console.log(`[${worker.name}] Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`[${worker.name}] Job ${job?.id} failed:`, err.message);
  });
}

console.log('Worker process started — listening on queues: email, notifications, reminders');

const shutdown = async () => {
  console.log('Shutting down workers gracefully…');
  await Promise.all(workers.map((w) => w.close()));
  await workerConnection.quit();
  console.log('Workers shut down');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
