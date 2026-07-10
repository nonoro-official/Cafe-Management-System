import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utilities/apiError.js';
import { logger } from '../utilities/logger.js';
import { env } from '../config/env.js';

/**
 * Normalises the many error shapes we can encounter (ApiError, Mongoose
 * validation/cast/duplicate-key, JWT errors, generic errors) into a single
 * structure with a status code, message and optional field details.
 */
const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return { statusCode: error.statusCode, message: error.message, details: error.details };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((fieldError) => ({
      field: fieldError.path,
      message: fieldError.message,
    }));
    return { statusCode: 422, message: 'Validation failed', details };
  }

  if (error instanceof mongoose.Error.CastError) {
    return { statusCode: 400, message: `Invalid value for "${error.path}": ${error.value}` };
  }

  if (error.code === 11000) {
    const fields = Object.keys(error.keyValue || {});
    const field = fields[0] || 'field';
    return {
      statusCode: 409,
      message: `A record with this ${field} already exists`,
      details: error.keyValue,
    };
  }

  if (error instanceof jwt.TokenExpiredError) {
    return { statusCode: 401, message: 'Session expired, please log in again' };
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return { statusCode: 401, message: 'Invalid authentication token' };
  }

  if (error.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'Malformed JSON payload' };
  }

  return { statusCode: error.statusCode || 500, message: error.message || 'Internal server error' };
};

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity (4 args).
export const errorHandler = (error, req, res, next) => {
  const { statusCode, message, details } = normalizeError(error);

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode} ${message}`, {
      stack: error.stack,
    });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} -> ${statusCode} ${message}`);
  }

  const body = { success: false, message };

  if (details !== undefined) {
    body.details = details;
  }

  if (!env.isProduction && statusCode >= 500) {
    body.stack = error.stack;
  }

  res.status(statusCode).json(body);
};
