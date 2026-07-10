import { body } from 'express-validator';

const passwordRules = (field) =>
  body(field)
    .isString()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain a number');

export const registerValidator = [
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  passwordRules('password'),
  body('phone').optional().isString().trim(),
];

export const loginValidator = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

export const updateProfileValidator = [
  body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().isString().trim(),
];

export const changePasswordValidator = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  passwordRules('newPassword'),
];
