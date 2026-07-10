import { body } from 'express-validator';

export const addCartItemValidator = [
  body('productId').isMongoId().withMessage('A valid productId is required'),
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('quantity must be a positive integer')
    .toInt(),
];

export const updateCartItemValidator = [
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer').toInt(),
];
