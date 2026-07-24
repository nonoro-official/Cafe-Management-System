import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utilities/apiError.js';
import { parsePagination, buildPaginationMeta } from '../utilities/pagination.js';

class CategoryService {
  async list(query = {}) {
    const { page, limit, skip } = parsePagination(query);

    const filter = {};
    if (query.search) {
      filter.name = new RegExp(query.search.trim(), 'i');
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true' || query.isActive === true;
    }

    const direction = query.order === 'asc' ? 1 : -1;
    const sortField = ['name', 'sortOrder', 'createdAt'].includes(query.sort)
      ? query.sort
      : 'sortOrder';

    const [categories, total] = await Promise.all([
      Category.find(filter)
        .sort({ [sortField]: direction, name: 1 })
        .skip(skip)
        .limit(limit),
      Category.countDocuments(filter),
    ]);

    return { categories, meta: buildPaginationMeta({ page, limit, total }) };
  }

  async getById(id) {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  }

  async create(payload) {
    const existing = await Category.findOne({ name: payload.name });
    if (existing) {
      throw ApiError.conflict('A category with this name already exists');
    }
    return Category.create(payload);
  }

  async update(id, payload) {
    const category = await Category.findById(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }

    if (payload.name && payload.name !== category.name) {
      const clash = await Category.findOne({ name: payload.name });
      if (clash) {
        throw ApiError.conflict('A category with this name already exists');
      }
    }

    ['name', 'description', 'sortOrder', 'isActive'].forEach((field) => {
      if (payload[field] !== undefined) {
        category[field] = payload[field];
      }
    });

    await category.save();
    return category;
  }

  async remove(id) {
    const productCount = await Product.countDocuments({ category: id });
    if (productCount > 0) {
      throw ApiError.conflict(
        `Cannot delete a category with ${productCount} product(s). Reassign or remove them first.`,
      );
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      throw ApiError.notFound('Category not found');
    }
    return category;
  }
}

export const categoryService = new CategoryService();
