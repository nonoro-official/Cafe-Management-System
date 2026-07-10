import { Router } from 'express';
import * as cartController from '../controllers/cart.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utilities/constants.js';
import { mongoIdParam } from '../validators/common.validator.js';
import { addCartItemValidator, updateCartItemValidator } from '../validators/cart.validator.js';

const router = Router();

// The cart is a customer-facing ordering feature.
router.use(authenticate, authorize(ROLES.CUSTOMER));

router.get('/', cartController.getCart);
router.post('/items', validate(addCartItemValidator), cartController.addItem);
router.patch(
  '/items/:itemId',
  validate([mongoIdParam('itemId'), ...updateCartItemValidator]),
  cartController.updateItem,
);
router.delete('/items/:itemId', validate([mongoIdParam('itemId')]), cartController.removeItem);
router.delete('/', cartController.clearCart);

export default router;
