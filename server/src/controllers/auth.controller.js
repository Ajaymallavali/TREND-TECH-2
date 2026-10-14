import { asyncHandler } from '../utils/asyncHandler.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { setAuthCookies, clearAuthCookies } from '../services/token.service.js';
import * as authService from '../services/auth.service.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  sendSuccess(res, { data: { user, accessToken }, message: 'Account created', statusCode: 201 });
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.loginUser(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  sendSuccess(res, { data: { user, accessToken }, message: 'Logged in successfully' });
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.googleLogin(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  sendSuccess(res, { data: { user, accessToken }, message: 'Logged in with Google' });
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refreshSession(token);
  setAuthCookies(res, { accessToken, refreshToken });
  sendSuccess(res, { data: { user, accessToken }, message: 'Session refreshed' });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (refreshToken) {
    await authService.logoutUserByRefreshToken(refreshToken);
  } else if (req.user) {
    await authService.logoutUser(req.user._id);
  }

  clearAuthCookies(res);
  sendSuccess(res, { data: {}, message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  sendSuccess(res, { data: { user: req.user }, message: 'Success' });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { token } = await authService.requestPasswordReset(req.body.email);
  // In production this is emailed, never returned in the API response.
  if (token) {
    logger.info({ email: req.body.email }, 'Password reset requested');
  }

  sendSuccess(res, {
    data: env.NODE_ENV === 'development' && token ? { resetToken: token } : {},
    message: 'If an account exists for this email, a reset link has been sent.',
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  sendSuccess(res, { data: {}, message: 'Password reset successful. Please log in.' });
});

export const changePassword = asyncHandler(async (req, res) => {
  await authService.changePassword({ userId: req.user._id, ...req.body });
  sendSuccess(res, { data: {}, message: 'Password changed successfully' });
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const { notificationPreferences } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.unauthorized('USER_NOT_FOUND', 'User no longer exists');

  if (notificationPreferences) {
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...notificationPreferences,
    };
  }

  await user.save();
  sendSuccess(res, { data: { user }, message: 'Preferences updated successfully' });
});
