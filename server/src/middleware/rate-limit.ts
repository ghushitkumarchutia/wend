import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { ioRedisClient } from '../common/redis.js';
import { RATE_LIMITS } from '../shared/constants.js';

function createLimiter(key: string, limit: number, windowMs: number) {
  return rateLimit({
    windowMs,
    max: limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (command: string, ...args: string[]) =>
        ioRedisClient.call(command, ...args) as never,
      prefix: `rl:${key}:`,
    }),
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many requests, please try again later',
        details: null,
      },
    },
  });
}

export const authLimiter = createLimiter(
  'auth',
  RATE_LIMITS.SIGN_IN.limit,
  RATE_LIMITS.SIGN_IN.windowMs,
);

export const generalGetLimiter = createLimiter(
  'get',
  RATE_LIMITS.GENERAL_GET.limit,
  RATE_LIMITS.GENERAL_GET.windowMs,
);

export const generalMutateLimiter = createLimiter(
  'mutate',
  RATE_LIMITS.GENERAL_MUTATE.limit,
  RATE_LIMITS.GENERAL_MUTATE.windowMs,
);

export const publicLimiter = createLimiter(
  'public',
  RATE_LIMITS.PUBLIC.limit,
  RATE_LIMITS.PUBLIC.windowMs,
);

export const inviteLimiter = createLimiter(
  'invite',
  RATE_LIMITS.INVITE.limit,
  RATE_LIMITS.INVITE.windowMs,
);

export const chatLimiter = createLimiter('chat', RATE_LIMITS.CHAT.limit, RATE_LIMITS.CHAT.windowMs);

export const pollLimiter = createLimiter('poll', RATE_LIMITS.POLL.limit, RATE_LIMITS.POLL.windowMs);

export const uploadLimiter = createLimiter(
  'upload',
  RATE_LIMITS.UPLOAD.limit,
  RATE_LIMITS.UPLOAD.windowMs,
);

export const adminLimiter = createLimiter(
  'admin',
  RATE_LIMITS.ADMIN.limit,
  RATE_LIMITS.ADMIN.windowMs,
);
