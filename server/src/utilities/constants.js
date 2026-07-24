/**
 * Shared domain constants for the Cafe Management API.
 */

export const ROLES = Object.freeze({
  ADMIN: 'admin',
  CUSTOMER: 'customer',
});

export const ROLE_VALUES = Object.values(ROLES);

export const ORDER_TYPES = Object.freeze({
  DINE_IN: 'dine-in',
  TAKEOUT: 'takeout',
});

export const ORDER_TYPE_VALUES = Object.values(ORDER_TYPES);

export const ORDER_STATUS = Object.freeze({
  PENDING: 'pending',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);

/**
 * Allowed forward transitions for order status. Terminal states have no
 * outgoing transitions.
 */
export const ORDER_STATUS_TRANSITIONS = Object.freeze({
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.READY]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
});

export const PAYMENT_METHODS = Object.freeze({
  CASH: 'cash',
  CASHLESS: 'cashless',
});

export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHODS);

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
});

export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);

export const PAGINATION = Object.freeze({
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
});
