import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utilities/apiResponse.js';
import { productService } from '../services/product.service.js';

export const listProducts = asyncHandler(async (req, res) => {
  const { products, meta } = await productService.list(req.query);
  sendSuccess(res, { data: products, meta });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await productService.getById(req.params.id);
  sendSuccess(res, { data: { product } });
});

export const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.create(req.body);
  sendCreated(res, { message: 'Product created', data: { product } });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'Product updated', data: { product } });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await productService.remove(req.params.id);
  sendSuccess(res, { message: 'Product deleted' });
});
