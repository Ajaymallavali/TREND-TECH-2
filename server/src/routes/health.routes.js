import { Router } from 'express';
import mongoose from 'mongoose';
import { cacheClient } from '../config/redis.js';
import { sendSuccess } from '../utils/apiResponse.js';

const router = Router();

router.get('/', async (req, res) => {
  const mongoState = mongoose.connection.readyState; // 1 = connected
  let redisOk = false;
  try {
    redisOk = (await cacheClient.ping()) === 'PONG';
  } catch {
    redisOk = false;
  }

  const healthy = mongoState === 1 && redisOk;

  sendSuccess(res, {
    statusCode: healthy ? 200 : 503,
    message: healthy ? 'OK' : 'Degraded',
    data: {
      uptime: process.uptime(),
      mongo: mongoState === 1 ? 'connected' : 'disconnected',
      redis: redisOk ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
