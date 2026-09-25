import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

let isConnected = false;

export async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return mongoose.connection;

  try {
    await mongoose.connect(env.MONGODB_URI, {
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    logger.info('MongoDB connected');
    return mongoose.connection;
  } catch (err) {
    isConnected = false;
    logger.error({ err }, 'MongoDB connection failed');
    throw err;
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
