import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';
import { startSyncWorker } from './jobs/syncWorker.js';
import { cacheClient } from './config/redis.js';

async function bootstrap() {
  await connectDB();

  const syncWorker = startSyncWorker();

  logger.info({
    Gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured',
    SerpApi: process.env.SERPAPI_API_KEY ? 'configured' : 'not configured',
    'Google CSE': (process.env.GOOGLE_CSE_KEY && process.env.GOOGLE_CSE_ID) ? 'configured' : 'not configured',
    Tavily: process.env.TAVILY_API_KEY ? 'configured' : 'not configured',
    MongoDB: 'connected',
  }, 'Service startup configurations');

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 TREND-TECH API listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = async (signal) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      if (syncWorker) await syncWorker.close().catch(() => {});
      await disconnectDB();
      cacheClient.disconnect();
      logger.info('Shutdown complete.');
      process.exit(0);
    });
    // Force-exit if graceful shutdown hangs
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled promise rejection');
  });
  process.on('uncaughtException', (err) => {
    logger.error({ err }, 'Uncaught exception');
    process.exit(1);
  });
}

let appInstance = null;

if (!process.env.VERCEL) {
  bootstrap().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err);
    process.exit(1);
  });
} else {
  appInstance = createApp();
}

export default appInstance;
