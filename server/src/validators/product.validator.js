import { body, query } from 'express-validator';

export const createProductValidator = [
  body('name').isString().trim().notEmpty().withMessage('Product name is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number').toFloat(),
  body('category').isMongoId().withMessage('A valid category id is required'),
  body('description').optional().isString().trim(),
  body('tags').optional().isArray().withMessage('tags must be an array'),
  body('tags.*').optional().isString().trim(),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
    .toBoolean(),
];

export const updateProductValidator = [
  body('name').optional().isString().trim().notEmpty().withMessage('Product name cannot be empty'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a non-negative number')
    .toFloat(),
  body('category').optional().isMongoId().withMessage('A valid category id is required'),
  body('description').optional().isString().trim(),
  body('tags').optional().isArray().withMessage('tags must be an array'),
  body('tags.*').optional().isString().trim(),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
    .toBoolean(),
];

export const listProductsValidator = [
  query('category').optional().isMongoId().withMessage('category must be a valid id'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be >= 0').toFloat(),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be >= 0').toFloat(),
  query('available').optional().isBoolean().withMessage('available must be a boolean').toBoolean(),
];
