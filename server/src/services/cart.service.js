import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import { ApiError } from '../utilities/apiError.js';

class CartService {
  /**
   * Returns the customer's cart, creating an empty one on first access, with
   * populated product details and computed totals.
   */
  async getCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return this.#buildSummary(cart);
  }

  async addItem(userId, productId, quantity = 1) {
    const product = await Product.findById(productId);
    if (!product) {
      throw ApiError.notFound('Product not found');
    }
    if (!product.isAvailable) {
      throw ApiError.badRequest('This product is currently unavailable');
    }

    const cart = await this.#getOrCreateCart(userId);
    const existing = cart.items.find((item) => String(item.product) === String(productId));

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return this.#buildSummary(cart);
  }

  async updateItem(userId, itemId, quantity) {
    const cart = await this.#getOrCreateCart(userId);
    const item = cart.items.id(itemId);
    if (!item) {
      throw ApiError.notFound('Cart item not found');
    }

    item.quantity = quantity;
    await cart.save();
    return this.#buildSummary(cart);
  }

  async removeItem(userId, itemId) {
    const cart = await this.#getOrCreateCart(userId);
    const item = cart.items.id(itemId);
    if (!item) {
      throw ApiError.notFound('Cart item not found');
    }

    item.deleteOne();
    await cart.save();
    return this.#buildSummary(cart);
  }

  async clear(userId) {
    const cart = await this.#getOrCreateCart(userId);
    cart.items = [];
    await cart.save();
    return this.#buildSummary(cart);
  }

  async #getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  async #buildSummary(cart) {
    await cart.populate('items.product', 'name price image isAvailable category');

    // Drop items whose product has since been deleted so totals stay correct.
    const validItems = cart.items.filter((item) => item.product);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    const items = validItems.map((item) => {
      const lineTotal = Number((item.product.price * item.quantity).toFixed(2));
      return {
        _id: item._id,
        product: item.product,
        quantity: item.quantity,
        lineTotal,
      };
    });

    const subtotal = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      _id: cart._id,
      user: cart.user,
      items,
      itemCount,
      subtotal,
      updatedAt: cart.updatedAt,
    };
  }
}

export const cartService = new CartService();
