import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess } from '../utilities/apiResponse.js';
import { receiptService } from '../services/receipt.service.js';
import { ApiError } from '../utilities/apiError.js';
import { ROLES } from '../utilities/constants.js';

/**
 * Customers may only access their own receipts; admins may access any.
 */
const assertAccess = (receipt, user) => {
  if (user.role === ROLES.ADMIN) {
    return;
  }
  if (!receipt.user || String(receipt.user) !== String(user.id)) {
    throw ApiError.notFound('Receipt not found');
  }
};

export const getReceiptByOrder = asyncHandler(async (req, res) => {
  const receipt = await receiptService.getByOrderId(req.params.orderId);
  assertAccess(receipt, req.user);
  sendSuccess(res, { data: { receipt } });
});

export const getReceipt = asyncHandler(async (req, res) => {
  const receipt = await receiptService.getById(req.params.id);
  assertAccess(receipt, req.user);
  sendSuccess(res, { data: { receipt } });
});

export const downloadReceiptPdf = asyncHandler(async (req, res) => {
  const receipt = await receiptService.getById(req.params.id);
  assertAccess(receipt, req.user);

  const pdf = await receiptService.renderPdf(receipt);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `${req.query.download === 'true' ? 'attachment' : 'inline'}; filename="receipt-${receipt.receiptNumber}.pdf"`,
  );
  res.send(pdf);
});
