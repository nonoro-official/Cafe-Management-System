import { Inventory } from '../models/inventory.model.js';
import { ApiError } from '../utilities/apiError.js';
import { parsePagination, buildPaginationMeta } from '../utilities/pagination.js';

// Thresholds mirror the admin UI's stock gauge tones.
export const OUT_OF_STOCK_AT = 15;
export const LOW_STOCK_AT = 35;

class InventoryService {
  async list(query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { category: regex }, { sku: regex }];
    }

    // Low-stock view (e.g. the dashboard panel) keeps the threshold server-side.
    if (String(query.lowStock) === 'true') {
      filter.stock = { $lte: LOW_STOCK_AT };
    }

    // The admin toolbar sends a combined "field:direction" sort value.
    const [rawField, rawDirection] = String(query.sort || 'name:asc').split(':');
    const sortField = ['name', 'stock', 'createdAt'].includes(rawField) ? rawField : 'name';
    const direction = rawDirection === 'desc' ? -1 : 1;

    const [items, total] = await Promise.all([
      Inventory.find(filter).sort({ [sortField]: direction }).skip(skip).limit(limit),
      Inventory.countDocuments(filter),
    ]);

    return { items, meta: buildPaginationMeta({ page, limit, total }) };
  }

  async summary() {
    const [result] = await Inventory.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: '$stock' },
          totalAssetValue: { $sum: { $multiply: ['$stock', '$unitValue'] } },
          lowStock: { $sum: { $cond: [{ $lte: ['$stock', LOW_STOCK_AT] }, 1, 0] } },
          outOfStock: { $sum: { $cond: [{ $lte: ['$stock', OUT_OF_STOCK_AT] }, 1, 0] } },
        },
      },
    ]);

    return (
      result || {
        totalProducts: 0,
        totalStock: 0,
        totalAssetValue: 0,
        lowStock: 0,
        outOfStock: 0,
      }
    );
  }

  async create(payload) {
    await this.#assertSkuAvailable(payload.sku);
    return Inventory.create(payload);
  }

  async update(id, payload) {
    const item = await Inventory.findById(id);
    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }

    if (payload.sku !== undefined) {
      await this.#assertSkuAvailable(payload.sku, id);
    }

    ['name', 'sub', 'category', 'sku', 'stock', 'unitValue'].forEach((field) => {
      // Note: `imageLoc` is a read-only virtual derived from the item name; it
      // is intentionally not settable here.
      if (payload[field] !== undefined) {
        item[field] = payload[field];
      }
    });

    await item.save();
    return item;
  }

  async remove(id) {
    const item = await Inventory.findByIdAndDelete(id);
    if (!item) {
      throw ApiError.notFound('Inventory item not found');
    }
    return item;
  }

  async #assertSkuAvailable(sku, excludeId) {
    if (!sku) return;
    const filter = { sku: sku.trim().toUpperCase() };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }
    const existing = await Inventory.exists(filter);
    if (existing) {
      throw ApiError.badRequest(`An inventory item with SKU "${sku}" already exists`);
    }
  }
}

export const inventoryService = new InventoryService();
