import { Router } from 'express';
import * as reportController from '../controllers/report.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { ROLES } from '../utilities/constants.js';

const router = Router();

// All reporting is admin-only.
router.use(authenticate, authorize(ROLES.ADMIN));

router.get('/overview', reportController.getDashboardOverview);
router.get('/sales', reportController.getSalesReport);
router.get('/top-products', reportController.getTopProducts);
router.get('/sales-trend', reportController.getSalesTrend);

export default router;
