import { body, query } from 'express-validator';
import {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  ORDER_TYPE_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS_VALUES,
} from '../utilities/constants.js';

const tableNumberRule = body('tableNumber')
  .optional({ nullable: true })
  .isString()
  .trim()
  .isLength({ max: 20 })
  .withMessage('Table number cannot exceed 20 characters');

export const createOrderValidator = [
  body('paymentMethod').isIn(PAYMENT_METHOD_VALUES).withMessage('Invalid payment method'),
  body('orderType').optional().isIn(ORDER_TYPE_VALUES).withMessage('Invalid order type'),
  tableNumberRule,
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

// Kiosk orders always carry explicit items (there is no server-side cart for
// the walk-up kiosk), so items are required here rather than optional.
export const createKioskOrderValidator = [
  body('paymentMethod').isIn(PAYMENT_METHOD_VALUES).withMessage('Invalid payment method'),
  body('orderType').optional().isIn(ORDER_TYPE_VALUES).withMessage('Invalid order type'),
  tableNumberRule,
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.productId').isMongoId().withMessage('Each item needs a valid productId'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be a positive integer')
    .toInt(),
];

// Staff-placed (point-of-sale) orders. Payment is usually taken later, so
// paymentMethod is optional (defaulted server-side). Staff may send the order
// straight to the kitchen, so an initial status of pending or preparing is
// accepted.
export const createRegisterOrderValidator = [
  body('orderType').optional().isIn(ORDER_TYPE_VALUES).withMessage('Invalid order type'),
  tableNumberRule,
  body('customerName').optional({ nullable: true }).isString().trim().isLength({ max: 120 }),
  body('paymentMethod').optional().isIn(PAYMENT_METHOD_VALUES).withMessage('Invalid payment method'),
  body('status')
    .optional()
    .isIn([ORDER_STATUS.PENDING, ORDER_STATUS.PREPARING])
    .withMessage('A new order must start as pending or preparing'),
  body('notes').optional().isString().trim().isLength({ max: 500 }),
  body('items').isArray({ min: 1 }).withMessage('items must be a non-empty array'),
  body('items.*.productId').isMongoId().withMessage('Each item needs a valid productId'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Each item quantity must be a positive integer')
    .toInt(),
];

export const updateOrderNotesValidator = [
  body('notes')
    .exists({ checkNull: true })
    .withMessage('notes is required')
    .bail()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
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
