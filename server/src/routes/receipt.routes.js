import { Router } from 'express';
import * as receiptController from '../controllers/receipt.controller.js';
import { authenticate } from '../middleware/authenticate.js';
import { validate } from '../middleware/validate.js';
import { mongoIdParam } from '../validators/common.validator.js';

const router = Router();

router.use(authenticate);

router.get(
  '/order/:orderId',
  validate([mongoIdParam('orderId')]),
  receiptController.getReceiptByOrder,
);
router.get('/:id', validate([mongoIdParam('id')]), receiptController.getReceipt);
router.get('/:id/pdf', validate([mongoIdParam('id')]), receiptController.downloadReceiptPdf);

export default router;
