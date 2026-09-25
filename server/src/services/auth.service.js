import argon2 from 'argon2';
import crypto from 'node:crypto';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  refreshExpiryDate,
} from './token.service.js';

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export async function registerUser({ name, email, password }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('EMAIL_TAKEN', 'An account with this email already exists');

  const passwordHash = await argon2.hash(password);
  const user = await User.create({ name, email, passwordHash });
  return issueSession(user);
}

export async function loginUser({ email, password }) {
  const user = await User.findOne({ email }).select(
    '+passwordHash +failedLoginAttempts +lockUntil'
  );

  // Constant-shape response whether or not the user exists, to avoid user enumeration.
  if (!user) throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');

  if (user.isLocked) {
    throw ApiError.forbidden(
      'ACCOUNT_LOCKED',
      'Account temporarily locked due to too many failed attempts. Try again later.'
    );
  }

  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();
    throw ApiError.unauthorized('INVALID_CREDENTIALS', 'Invalid email or password');
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  return issueSession(user);
}

export async function refreshSession(refreshToken) {
  if (!refreshToken) throw ApiError.unauthorized('NO_REFRESH_TOKEN', 'Refresh token missing');

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash +refreshTokenExpiresAt');
  if (!user || !user.refreshTokenHash) {
    throw ApiError.unauthorized('SESSION_NOT_FOUND', 'Session no longer valid');
  }

  const presentedHash = hashToken(refreshToken);
  if (presentedHash !== user.refreshTokenHash || user.refreshTokenExpiresAt < new Date()) {
    // Possible token reuse/theft - invalidate the whole session defensively.
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await user.save();
    throw ApiError.unauthorized('SESSION_INVALID', 'Session invalid, please log in again');
  }

  // Rotate: issue a brand new refresh token and invalidate the old one.
  return issueSession(user);
}

export async function logoutUserByRefreshToken(refreshToken) {
  if (!refreshToken) return;

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return;
  }

  const user = await User.findById(decoded.sub).select('+refreshTokenHash');
  if (!user) return;

  const presentedHash = hashToken(refreshToken);
  if (user.refreshTokenHash === presentedHash) {
    user.refreshTokenHash = null;
    user.refreshTokenExpiresAt = null;
    await user.save();
  }
}

export async function logoutUser(userId) {
  await User.findByIdAndUpdate(userId, {
    refreshTokenHash: null,
    refreshTokenExpiresAt: null,
  });
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email });
  // Always behave the same way to avoid leaking which emails are registered.
  if (!user) return { token: null };

  const rawToken = crypto.randomBytes(32).toString('hex');
  user.passwordResetTokenHash = hashToken(rawToken);
  user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min
  await user.save();

  return { token: rawToken, user };
}

export async function resetPassword({ token, password }) {
  const tokenHash = hashToken(token);
  const user = await User.findOne({
    passwordResetTokenHash: tokenHash,
    passwordResetExpiresAt: { $gt: new Date() },
  }).select('+passwordResetTokenHash +passwordResetExpiresAt');

  if (!user) throw ApiError.badRequest('INVALID_RESET_TOKEN', 'Reset link is invalid or expired');

  user.passwordHash = await argon2.hash(password);
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.refreshTokenHash = null; // force re-login everywhere
  user.refreshTokenExpiresAt = null;
  await user.save();
}

export async function changePassword({ userId, currentPassword, newPassword }) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw ApiError.notFound('USER_NOT_FOUND', 'User not found');

  const valid = await argon2.verify(user.passwordHash, currentPassword);
  if (!valid) throw ApiError.badRequest('INVALID_PASSWORD', 'Current password is incorrect');

  user.passwordHash = await argon2.hash(newPassword);
  await user.save();
}

// --- internal helper ---
async function issueSession(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  user.refreshTokenHash = hashToken(refreshToken);
  user.refreshTokenExpiresAt = refreshExpiryDate();
  await user.save();

  return { user, accessToken, refreshToken };
}
