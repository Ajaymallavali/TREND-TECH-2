import { ApiError } from '../utils/ApiError.js';

/**
 * validate({ body, query, params }) - each value is a Zod schema.
 * On success, req.body/query/params are replaced with the *parsed* (typed, defaulted) data.
 */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) req.query = schemas.query.parse(req.query);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      next();
    } catch (err) {
      if (err.name === 'ZodError') {
        return next(
          ApiError.badRequest('VALIDATION_ERROR', 'Invalid request data', err.flatten().fieldErrors)
        );
      }
      next(err);
    }
  };
}
