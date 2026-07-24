import { asyncHandler } from '../utilities/asyncHandler.js';
import { sendSuccess, sendCreated } from '../utilities/apiResponse.js';
import { inventoryService } from '../services/inventory.service.js';

export const listInventory = asyncHandler(async (req, res) => {
  const { items, meta } = await inventoryService.list(req.query);
  sendSuccess(res, { data: items, meta });
});

export const getInventorySummary = asyncHandler(async (req, res) => {
  const summary = await inventoryService.summary();
  sendSuccess(res, { data: summary });
});

export const createInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.create(req.body);
  sendCreated(res, { message: 'Inventory item created', data: { item } });
});

export const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await inventoryService.update(req.params.id, req.body);
  sendSuccess(res, { message: 'Inventory item updated', data: { item } });
});

export const deleteInventoryItem = asyncHandler(async (req, res) => {
  await inventoryService.remove(req.params.id);
  sendSuccess(res, { message: 'Inventory item deleted' });
});
