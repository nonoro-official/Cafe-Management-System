import { body } from 'express-validator';

export const createInventoryValidator = [
  body('name').isString().trim().notEmpty().withMessage('Item name is required'),
  body('sku').isString().trim().notEmpty().withMessage('SKU is required'),
  body('stock')
    .isFloat({ min: 0 })
    .withMessage('Stock must be a non-negative number')
    .toFloat(),
  body('sub').optional().isString().trim(),
  body('category').optional().isString().trim(),
  body('image').optional().isString().trim(),
  body('unitValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit value must be a non-negative number')
    .toFloat(),
];

export const updateInventoryValidator = [
  body('name').optional().isString().trim().notEmpty().withMessage('Item name cannot be empty'),
  body('sku').optional().isString().trim().notEmpty().withMessage('SKU cannot be empty'),
  body('stock')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Stock must be a non-negative number')
    .toFloat(),
  body('sub').optional().isString().trim(),
  body('category').optional().isString().trim(),
  body('image').optional().isString().trim(),
  body('unitValue')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit value must be a non-negative number')
    .toFloat(),
];
