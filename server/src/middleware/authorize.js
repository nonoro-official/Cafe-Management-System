import { ApiError } from '../utilities/apiError.js';

/**
 * Restricts a route to one or more roles. Must run after `authenticate`.
 *
 * @param {...string} allowedRoles
 * @returns {import('express').RequestHandler}
 */
export const authorize =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(ApiError.forbidden('You do not have permission to perform this action'));
      return;
    }

    next();
  };
