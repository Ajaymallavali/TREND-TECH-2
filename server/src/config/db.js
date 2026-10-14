import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

let isConnected = false;

export function isDBConnected() {
  return mongoose.connection.readyState === 1;
}

export async function connectDB() {
  if (isDBConnected()) return mongoose.connection;

  // In cloud serverless (like Vercel), skip attempting localhost to avoid delay
  if (process.env.VERCEL && env.MONGODB_URI.includes('localhost')) {
    logger.warn('Skipping MongoDB connection: Running on Vercel without remote MONGODB_URI');
    return null;
  }

  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    logger.info('MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    isConnected = false;
    logger.warn({ errMessage: err.message }, 'MongoDB connection unavailable — fallback catalog active');
    return null;
  }
}

export async function disconnectDB() {
  if (!isConnected) return;
  try {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error({ err }, 'MongoDB disconnection failed');
    throw err;
  }
}

mongoose.connection.on('error', (err) => {
  isConnected = false;
  logger.error({ err }, 'MongoDB connection error');
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  logger.warn('MongoDB disconnected');
});
