import { validationResult } from 'express-validator';
import { ApiError } from '../utilities/apiError.js';

/**
 * Runs a set of express-validator chains and rejects the request with a 422 if
 * any of them fail. Designed to be spread into a route definition:
 *
 *   router.post('/', validate(createRules), controller.create)
 *
 * @param {import('express-validator').ValidationChain[]} validations
 * @returns {import('express').RequestHandler[]}
 */
export const validate = (validations) => [
  ...validations,
  (req, res, next) => {
    const result = validationResult(req);

    if (result.isEmpty()) {
      next();
      return;
    }

    const details = result.array().map((error) => ({
      field: error.path,
      message: error.msg,
    }));

    next(ApiError.unprocessable('Validation failed', details));
  },
];
