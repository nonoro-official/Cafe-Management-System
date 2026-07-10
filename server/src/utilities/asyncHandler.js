/**
 * Wraps an async Express handler so rejected promises are forwarded to the
 * central error-handling middleware instead of crashing the process.
 *
 * @param {import('express').RequestHandler} handler
 * @returns {import('express').RequestHandler}
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
