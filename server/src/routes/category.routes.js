import { Router } from 'express';
import * as categoryController from '../controllers/category.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utilities/constants.js';
import { mongoIdParam, paginationQuery } from '../validators/common.validator.js';
import {
  createCategoryValidator,
  updateCategoryValidator,
} from '../validators/category.validator.js';

const router = Router();

// Public browsing.
router.get('/', validate(paginationQuery), categoryController.listCategories);
router.get('/:id', validate([mongoIdParam('id')]), categoryController.getCategory);

// Admin management.
router.post(
  '/',
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createCategoryValidator),
  categoryController.createCategory,
);
router.put(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate([mongoIdParam('id'), ...updateCategoryValidator]),
  categoryController.updateCategory,
);
router.delete(
  '/:id',
  authenticate,
  authorize(ROLES.ADMIN),
  validate([mongoIdParam('id')]),
  categoryController.deleteCategory,
);

export default router;
