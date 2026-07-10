/**
 * Helpers producing the consistent response envelope used across the API:
 * `{ success, message?, data?, meta? }`.
 */

export const sendSuccess = (res, { statusCode = 200, message, data, meta } = {}) => {
  const payload = { success: true };

  if (message !== undefined) {
    payload.message = message;
  }

  if (data !== undefined) {
    payload.data = data;
  }

  if (meta !== undefined) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};

export const sendCreated = (res, options = {}) =>
  sendSuccess(res, { statusCode: 201, ...options });
