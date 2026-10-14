import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  MONGODB_URI: z.string().default(process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech'),
  REDIS_URL: z.string().default(process.env.REDIS_URL || 'redis://localhost:6379'),

  JWT_ACCESS_SECRET: z.string().min(16).default('trendtech_default_access_secret_2026_xyz'),
  JWT_REFRESH_SECRET: z.string().min(16).default('trendtech_default_refresh_secret_2026_xyz'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  COOKIE_SECRET: z.string().min(16).default('trendtech_default_cookie_secret_2026_xyz'),

  GOOGLE_CLIENT_ID: z.string().optional().default('264204286937-gg132tridl4n33afjl724i67sm2pts3c.apps.googleusercontent.com'),

  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('TREND-TECH <no-reply@trend-tech.app>'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.warn('⚠️ Non-fatal environment configuration warning:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : {
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: 'info',
  PORT: Number(process.env.PORT) || 5000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/trend-tech',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'trendtech_default_access_secret_2026_xyz',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'trendtech_default_refresh_secret_2026_xyz',
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'trendtech_default_cookie_secret_2026_xyz',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '264204286937-gg132tridl4n33afjl724i67sm2pts3c.apps.googleusercontent.com',
  SMTP_HOST: '',
  SMTP_PORT: 587,
  SMTP_USER: '',
  SMTP_PASSWORD: '',
  SMTP_FROM: 'TREND-TECH <no-reply@trend-tech.app>',
  RATE_LIMIT_WINDOW_MS: 900000,
  RATE_LIMIT_MAX: 300,
};
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
