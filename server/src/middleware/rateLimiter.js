import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../utils/apiResponse.js';

function handler(req, res) {
  sendError(res, {
    statusCode: 429,
    code: 'RATE_LIMITED',
    message: 'Too many requests. Please try again later.',
  });
}

// General API-wide limiter
export const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});

// Stricter limiter for auth endpoints (login/register/forgot-password) to slow brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
