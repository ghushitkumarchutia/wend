import { Redis } from 'ioredis';
import { env } from './env';

export const ioRedisClient = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const redisClient = new Redis(env.REDIS_URL);
