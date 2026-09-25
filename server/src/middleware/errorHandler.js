import { ApiError } from '../utils/ApiError.js';
import { sendError } from '../utils/apiResponse.js';
import { logger } from '../config/logger.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(req, res, next) {
  next(ApiError.notFound('ROUTE_NOT_FOUND', `Cannot ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    if (err.statusCode >= 500) {
      logger.error({ err, path: req.originalUrl }, err.message);
    } else {
      logger.warn({ code: err.code, path: req.originalUrl }, err.message);
    }
    return sendError(res, {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    return sendError(res, {
      statusCode: 409,
      code: 'DUPLICATE_RESOURCE',
      message: 'A resource with these unique fields already exists',
      details: err.keyValue,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return sendError(res, {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: Object.fromEntries(
        Object.entries(err.errors || {}).map(([k, v]) => [k, v.message])
      ),
    });
  }

  logger.error({ err, path: req.originalUrl }, 'Unhandled error');

  return sendError(res, {
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    message: isProd ? 'Something went wrong' : err.message,
  });
}
