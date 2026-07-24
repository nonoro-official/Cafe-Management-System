import { Product } from '../models/product.model.js';
import { Category } from '../models/category.model.js';
import { ApiError } from '../utilities/apiError.js';
import { parsePagination, buildPaginationMeta } from '../utilities/pagination.js';

class ProductService {
  async list(query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.category) {
      filter.category = query.category;
    }

    if (query.available !== undefined) {
      filter.isAvailable = query.available === 'true' || query.available === true;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.price = {};
      if (query.minPrice !== undefined) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice !== undefined) filter.price.$lte = Number(query.maxPrice);
    }

    if (query.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ name: regex }, { description: regex }, { tags: regex }];
    }

    const direction = query.order === 'asc' ? 1 : -1;
    const sortField = ['name', 'price', 'createdAt'].includes(query.sort)
      ? query.sort
      : 'createdAt';

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort({ [sortField]: direction })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    return { products, meta: buildPaginationMeta({ page, limit, total }) };
  }

  async getById(id) {
    const product = await Product.findById(id).populate('category', 'name slug');
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  async create(payload) {
    await this.#assertCategoryExists(payload.category);
    const product = await Product.create(payload);
    return product.populate('category', 'name slug');
  }

  async update(id, payload) {
    if (payload.category) {
      await this.#assertCategoryExists(payload.category);
    }

    const product = await Product.findById(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    ['name', 'description', 'price', 'category', 'tags', 'isAvailable'].forEach((field) => {
      if (payload[field] !== undefined) {
        product[field] = payload[field];
      }
    });

    await product.save();
    return product.populate('category', 'name slug');
  }

  async remove(id) {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    return product;
  }

  async #assertCategoryExists(categoryId) {
    const exists = await Category.exists({ _id: categoryId });
    if (!exists) {
      throw ApiError.badRequest('The specified category does not exist');
    }
  }
}

export const productService = new ProductService();
