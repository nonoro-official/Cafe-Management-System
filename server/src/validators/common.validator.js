import { param, query } from 'express-validator';

/**
 * Validates that a route parameter is a well-formed Mongo ObjectId.
 *
 * @param {string} name
 */
export const mongoIdParam = (name = 'id') =>
  param(name).isMongoId().withMessage(`Invalid ${name}`);

/**
 * Shared pagination + sorting query validators reused across list endpoints.
 */
export const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),
  query('sort').optional().isString().trim(),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('order must be "asc" or "desc"'),
  query('search').optional().isString().trim(),
];
