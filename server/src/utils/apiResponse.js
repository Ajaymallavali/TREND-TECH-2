export function sendSuccess(res, { data = {}, message = 'Success', statusCode = 200, meta } = {}) {
  const payload = { success: true, data, message };
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
}

export function sendError(res, { statusCode = 500, code = 'INTERNAL_ERROR', message = 'Something went wrong', details } = {}) {
  const payload = { success: false, error: { code, message } };
  if (details) payload.error.details = details;
  return res.status(statusCode).json(payload);
}
