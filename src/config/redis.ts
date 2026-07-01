import Redis from 'ioredis';
import { logger } from '../utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) {
      return null;
    }
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

let lastLoggedError = 0;
redis.on('error', (err) => {
  const now = Date.now();
  if (now - lastLoggedError > 10000) {
    logger.error(`Redis error: ${err.message || err}`);
    lastLoggedError = now;
  }
});

// Graceful connect — won't crash app if Redis is unavailable
export const connectRedis = async () => {
  try {
    await redis.connect();
  } catch (err: any) {
    logger.warn(`Redis not available: ${err.message}. OTP/session features will use DB fallback.`);
  }
};

export default redis;
