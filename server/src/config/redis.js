import Redis from 'ioredis';
import { env } from './env.js';
import { logger } from './logger.js';

export function createRedisConnection(label = 'redis') {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times) {
      // Reconnect after 3 seconds without throwing unhandled exceptions
      return Math.min(times * 500, 3000);
    },
  });

  client.on('connect', () => logger.info(`[${label}] Redis connected`));
  client.on('error', (err) => logger.warn({ errMessage: err.message }, `[${label}] Redis connection pending`));

  return client;
}

export const cacheClient = new Redis(env.REDIS_URL, {
  enableReadyCheck: false,
  retryStrategy(times) {
    return Math.min(times * 500, 3000);
  },
});
cacheClient.on('error', (err) => logger.warn({ errMessage: err.message }, '[cache] Redis connection pending'));
