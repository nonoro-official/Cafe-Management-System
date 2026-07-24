import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utilities/apiResponse.js';
import { orderService } from '../services/order.service.js';

// --- Customer ---

export const createOrder = asyncHandler(async (req, res) => {
  const { order, receipt } = await orderService.create(req.user, req.body);
  sendCreated(res, { message: 'Order placed successfully', data: { order, receipt } });
});

// --- Public self-service kiosk (no authentication) ---

export const createKioskOrder = asyncHandler(async (req, res) => {
  const { order, receipt } = await orderService.createForKiosk(req.body);
  sendCreated(res, { message: 'Order placed successfully', data: { order, receipt } });
});

export const listMyOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.listForCustomer(req.user.id, req.query);
  sendSuccess(res, { data: orders, meta });
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getForCustomer(req.user.id, req.params.id);
  sendSuccess(res, { data: { order } });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelForCustomer(req.user.id, req.params.id);
  sendSuccess(res, { message: 'Order cancelled', data: { order } });
});

// --- Admin ---

export const createRegisterOrder = asyncHandler(async (req, res) => {
  const { order, receipt } = await orderService.createForRegister(req.user, req.body);
  sendCreated(res, { message: 'Order placed successfully', data: { order, receipt } });
});

export const listOrders = asyncHandler(async (req, res) => {
  const { orders, meta } = await orderService.adminList(req.query);
  sendSuccess(res, { data: orders, meta });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getById(req.params.id);
  sendSuccess(res, { data: { order } });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.body.status);
  sendSuccess(res, { message: 'Order status updated', data: { order } });
});

export const updateOrderPayment = asyncHandler(async (req, res) => {
  const order = await orderService.updatePaymentStatus(req.params.id, req.body.paymentStatus);
  sendSuccess(res, { message: 'Payment status updated', data: { order } });
});

export const updateOrderNotes = asyncHandler(async (req, res) => {
  const order = await orderService.updateNotes(req.params.id, req.body.notes);
  sendSuccess(res, { message: 'Order updated', data: { order } });
});
