import express from 'express';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import pinoHttp from 'pino-http';

import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.routes.js';
import apiRoutes from './routes/index.js';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL || true,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(mongoSanitize());
  // Ensure database is connected (essential for Vercel serverless cold starts)
  app.use(async (req, res, next) => {
    try {
      await connectDB();
    } catch {
      // Non-blocking fallback
    }
    next();
  });

  app.use('/api', apiLimiter);
  app.use('/api/health', healthRoutes);
  app.use('/api', apiRoutes);
  app.use('/health', healthRoutes);
  app.use('/', apiRoutes);

  // Serve product image files safely from local storage
  const productImagesPath = path.resolve(__dirname, 'data/product-images');
  app.use('/product-images', express.static(productImagesPath));
  app.use('/server/src/data/product-images', express.static(productImagesPath));

  // Serve static assets from client build for single combined server
  const clientDistPath = fs.existsSync(path.resolve(process.cwd(), 'client/dist'))
    ? path.resolve(process.cwd(), 'client/dist')
    : path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
      if (err) next();
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
