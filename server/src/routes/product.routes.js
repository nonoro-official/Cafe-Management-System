import { Router } from 'express';
import * as productController from '../controllers/product.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utilities/constants.js';
import { mongoIdParam, paginationQuery } from '../validators/common.validator.js';
import {
  createProductValidator,
  updateProductValidator,
  listProductsValidator,
} from '../validators/product.validator.js';

const router = Router();

// Public browsing with search, filtering, and pagination.
router.get('/', validate([...paginationQuery, ...listProductsValidator]), productController.listProducts);
router.get('/:id', validate([mongoIdParam('id')]), productController.getProduct);

// Admin management.
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createProductValidator),
  productController.createProduct,
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate([mongoIdParam('id'), ...updateProductValidator]),
  productController.updateProduct,
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate([mongoIdParam('id')]),
  productController.deleteProduct,
);

export default router;
