import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess } from '../utilities/apiResponse.js';
import { cartService } from '../services/cart.service.js';

export const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  sendSuccess(res, { data: { cart } });
});

export const addItem = asyncHandler(async (req, res) => {
  const cart = await cartService.addItem(req.user.id, req.body.productId, req.body.quantity ?? 1);
  sendSuccess(res, { message: 'Item added to cart', data: { cart } });
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItem(req.user.id, req.params.itemId, req.body.quantity);
  sendSuccess(res, { message: 'Cart item updated', data: { cart } });
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.itemId);
  sendSuccess(res, { message: 'Cart item removed', data: { cart } });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await cartService.clear(req.user.id);
  sendSuccess(res, { message: 'Cart cleared', data: { cart } });
});
