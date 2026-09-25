import { Worker } from 'bullmq';
import { createRedisConnection } from '../config/redis.js';
import { runPriceSync } from '../services/sync.service.js';
import { logger } from '../config/logger.js';

export function startSyncWorker() {
  try {
    const connection = createRedisConnection('sync-worker');
    const worker = new Worker('price-sync', async (job) => {
      logger.info({ jobName: job.name }, 'Processing background sync job');
      await runPriceSync();
    }, { 
      connection,
      concurrency: 1,
    });

    worker.on('completed', (job) => logger.info({ jobId: job.id }, 'Sync job completed successfully in worker'));
    worker.on('failed', (job, err) => logger.error({ jobId: job.id, err }, 'Sync job failed in worker'));
    
    logger.info('BullMQ sync worker started successfully');
    return worker;
  } catch (err) {
    logger.warn({ err }, 'Could not initialize BullMQ Worker. Sync will run in fallback modes.');
    return null;
  }
}
