import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { runPriceSync } from '../services/sync.service.js';
import { logger } from '../config/logger.js';

let syncQueue = null;

try {
  const connection = createRedisConnection('sync-queue');
  syncQueue = new Queue('price-sync', { connection });
} catch (err) {
  logger.warn('Could not initialize BullMQ Queue. Sync jobs will run in-process.');
}

export async function triggerPriceSyncJob() {
  if (syncQueue) {
    try {
      await syncQueue.add('run-sync', {}, { removeOnComplete: true });
      logger.info('Sync job added to BullMQ queue');
      return { success: true, queued: true };
    } catch (err) {
      logger.error({ err }, 'Failed to queue job, falling back to direct run');
    }
  }
  
  // Synchronous background fallback
  logger.info('Running sync job directly in-process.');
  runPriceSync().catch((err) => logger.error({ err }, 'Direct price sync execution failed'));
  return { success: true, queued: false };
}
