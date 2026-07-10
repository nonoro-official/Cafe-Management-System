import { body, query } from 'express-validator';
import {
  ORDER_STATUS_VALUES,
  ORDER_TYPE_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS_VALUES,
} from '../utilities/constants.js';

export const createOrderValidator = [
  body('paymentMethod').isIn(PAYMENT_METHOD_VALUES).withMessage('Invalid payment method'),
  body('orderType').optional().isIn(ORDER_TYPE_VALUES).withMessage('Invalid order type'),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  // Optional explicit items; when omitted the authenticated user's cart is used.
  body('items').optional().isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.productId').optional().isMongoId().withMessage('Each item needs a valid productId'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be a positive integer')
    .toInt(),
];

export const updateOrderStatusValidator = [
  body('status').isIn(ORDER_STATUS_VALUES).withMessage('Invalid order status'),
];

export const updatePaymentStatusValidator = [
  body('paymentStatus').isIn(PAYMENT_STATUS_VALUES).withMessage('Invalid payment status'),
];

export const listOrdersValidator = [
  query('status').optional().isIn(ORDER_STATUS_VALUES).withMessage('Invalid order status'),
  query('orderType').optional().isIn(ORDER_TYPE_VALUES).withMessage('Invalid order type'),
  query('paymentStatus')
    .optional()
    .isIn(PAYMENT_STATUS_VALUES)
    .withMessage('Invalid payment status'),
  query('from').optional().isISO8601().withMessage('from must be an ISO date'),
  query('to').optional().isISO8601().withMessage('to must be an ISO date'),
];
