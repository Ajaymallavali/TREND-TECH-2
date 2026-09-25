import { ApiError } from '../utils/ApiError.js';

/**
 * authorize('ADMIN') or authorize('ADMIN', 'USER')
 * Must run AFTER `authenticate`. Always re-checks server-side - never trust the client.
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('NOT_AUTHENTICATED', 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('INSUFFICIENT_ROLE', 'You do not have access to this resource'));
    }
    next();
  };
}
