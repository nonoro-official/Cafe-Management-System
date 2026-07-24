import { Router } from 'express';
import * as inventoryController from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utilities/constants.js';
import { mongoIdParam, paginationQuery } from '../validators/common.validator.js';
import {
  createInventoryValidator,
  updateInventoryValidator,
} from '../validators/inventory.validator.js';

const router = Router();

// Inventory management is admin-only.
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', validate(paginationQuery), inventoryController.listInventory);
router.get('/summary', inventoryController.getInventorySummary);
router.post('/', validate(createInventoryValidator), inventoryController.createInventoryItem);
router.put(
  '/:id',
  validate([mongoIdParam('id'), ...updateInventoryValidator]),
  inventoryController.updateInventoryItem,
);
router.delete(
  '/:id',
  validate([mongoIdParam('id')]),
  inventoryController.deleteInventoryItem,
);

export default router;
