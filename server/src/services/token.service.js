import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role, type: 'access' }, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

export function signRefreshToken(user) {
  return jwt.sign({ sub: user._id.toString(), type: 'refresh' }, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

export function verifyRefreshToken(token) {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (decoded.type !== 'refresh') throw new Error('Invalid refresh token type');
  return decoded;
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function durationToMs(value, fallback = 7 * 24 * 60 * 60 * 1000) {
  const match = /^\s*(\d+)\s*(s|m|h|d|w)\s*$/i.exec(value);
  if (!match) return fallback;
  const amount = Number(match[1]);
  const units = { s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000, w: 7 * 24 * 60 * 60 * 1000 };
  return amount * units[match[2].toLowerCase()];
}

export function refreshExpiryDate() {
  return new Date(Date.now() + durationToMs(env.JWT_REFRESH_EXPIRES_IN));
}

const COOKIE_BASE = { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'lax', path: '/' };

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie('accessToken', accessToken, { ...COOKIE_BASE, maxAge: durationToMs(env.JWT_ACCESS_EXPIRES_IN, 15 * 60 * 1000) });
  res.cookie('refreshToken', refreshToken, { ...COOKIE_BASE, maxAge: durationToMs(env.JWT_REFRESH_EXPIRES_IN), path: '/api/auth/refresh' });
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken', { ...COOKIE_BASE });
  res.clearCookie('refreshToken', { ...COOKIE_BASE, path: '/api/auth/refresh' });
}
