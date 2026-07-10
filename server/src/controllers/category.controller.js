import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utilities/apiResponse.js';
import { categoryService } from '../services/category.service.js';

export const listCategories = asyncHandler(async (req, res) => {
  const { categories, meta } = await categoryService.list(req.query);
  sendSuccess(res, { data: categories, meta });
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.getById(req.params.id);
  sendSuccess(res, { data: { category } });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.create(req.body);
  sendCreated(res, { message: 'Category created', data: { category } });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'Category updated', data: { category } });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.remove(req.params.id);
  sendSuccess(res, { message: 'Category deleted' });
});
