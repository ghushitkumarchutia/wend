import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  throw new Error('REDIS_URL is required');
}

export const workerRedisUrl = redisUrl;
