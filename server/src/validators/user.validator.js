import { body } from 'express-validator';
import { ROLE_VALUES } from '../utilities/constants.js';

export const createUserValidator = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(ROLE_VALUES).withMessage('Invalid role'),
  body('phone').optional().isString().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean').toBoolean(),
];

export const updateUserValidator = [
  body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .optional()
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(ROLE_VALUES).withMessage('Invalid role'),
  body('phone').optional().isString().trim(),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean').toBoolean(),
];
