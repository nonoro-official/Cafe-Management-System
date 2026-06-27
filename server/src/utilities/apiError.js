/**
 * Shared utility helpers for the Cafe Management API.
 */

export const createApiError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};
