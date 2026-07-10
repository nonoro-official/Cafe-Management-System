import { asyncHandler } from '../utilities/asyncHandler.js';
import { ApiError } from '../utilities/apiError.js';
import { verifyToken } from '../utilities/token.js';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';

const extractToken = (req) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7).trim();
  }

  const cookieToken = req.cookies?.[env.jwt.cookieName];
  if (cookieToken) {
    return cookieToken;
  }

  return null;
};

/**
 * Requires a valid JWT. Loads the owning user, ensures the account is still
 * active, and attaches it to `req.user`.
 */
export const authenticate = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  const decoded = verifyToken(token);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('Account is no longer active');
  }

  req.user = user;
  next();
});
