import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utilities/constants.js';
import { mongoIdParam, paginationQuery } from '../validators/common.validator.js';
import {
  createOrderValidator,
  listOrdersValidator,
  updateOrderStatusValidator,
  updatePaymentStatusValidator,
} from '../validators/order.validator.js';

const router = Router();

router.use(authenticate);

// --- Customer ordering ---
router.post(
  '/',
  authorize(ROLES.CUSTOMER),
  validate(createOrderValidator),
  orderController.createOrder,
);
router.get(
  '/my',
  authorize(ROLES.CUSTOMER),
  validate(paginationQuery),
  orderController.listMyOrders,
);
router.get(
  '/my/:id',
  authorize(ROLES.CUSTOMER),
  validate([mongoIdParam('id')]),
  orderController.getMyOrder,
);
router.patch(
  '/my/:id/cancel',
  authorize(ROLES.CUSTOMER),
  validate([mongoIdParam('id')]),
  orderController.cancelMyOrder,
);

// --- Admin management ---
router.get(
  '/',
  authorize(ROLES.ADMIN),
  validate([...paginationQuery, ...listOrdersValidator]),
  orderController.listOrders,
);
router.get('/:id', authorize(ROLES.ADMIN), validate([mongoIdParam('id')]), orderController.getOrder);
router.patch(
  '/:id/status',
  authorize(ROLES.ADMIN),
  validate([mongoIdParam('id'), ...updateOrderStatusValidator]),
  orderController.updateOrderStatus,
);
router.patch(
  '/:id/payment',
  authorize(ROLES.ADMIN),
  validate([mongoIdParam('id'), ...updatePaymentStatusValidator]),
  orderController.updateOrderPayment,
);

export default router;
