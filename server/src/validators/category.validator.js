import { body } from 'express-validator';

export const createCategoryValidator = [
  body('name').isString().trim().notEmpty().withMessage('Category name is required'),
  body('description').optional().isString().trim(),
  body('sortOrder').optional().isInt().withMessage('sortOrder must be an integer').toInt(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean').toBoolean(),
];

export const updateCategoryValidator = [
  body('name').optional().isString().trim().notEmpty().withMessage('Category name cannot be empty'),
  body('description').optional().isString().trim(),
  body('sortOrder').optional().isInt().withMessage('sortOrder must be an integer').toInt(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean').toBoolean(),
];
