import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.model.js';

function extractToken(req) {
  if (req.cookies?.accessToken) return req.cookies.accessToken;
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized('NO_TOKEN', 'Authentication token missing');

  let decoded;
  try {
    decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('TOKEN_EXPIRED', 'Access token expired');
    }
    throw ApiError.unauthorized('INVALID_TOKEN', 'Invalid access token');
  }

  const user = await User.findById(decoded.sub).select('-passwordHash');
  if (!user) throw ApiError.unauthorized('USER_NOT_FOUND', 'User no longer exists');
  if (user.isLocked) throw ApiError.forbidden('ACCOUNT_LOCKED', 'Account is locked');

  req.user = user;
  next();
});

// Attaches req.user if a valid token is present, but never rejects the request.
export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    const user = await User.findById(decoded.sub).select('-passwordHash');
    if (user && !user.isLocked) req.user = user;
  } catch {
    // silently ignore - optional auth
  }
  next();
});
