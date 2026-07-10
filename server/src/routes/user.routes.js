import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import { ROLES } from '../utilities/constants.js';
import { mongoIdParam, paginationQuery } from '../validators/common.validator.js';
import { createUserValidator, updateUserValidator } from '../validators/user.validator.js';

const router = Router();

// Every user-management endpoint is admin-only.
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/', validate(paginationQuery), userController.listUsers);
router.post('/', validate(createUserValidator), userController.createUser);
router.get('/:id', validate([mongoIdParam('id')]), userController.getUser);
router.put('/:id', validate([mongoIdParam('id'), ...updateUserValidator]), userController.updateUser);
router.delete('/:id', validate([mongoIdParam('id')]), userController.deleteUser);

export default router;
