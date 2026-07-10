import { Order } from '../models/order.model.js';
import { Cart } from '../models/cart.model.js';
import { Product } from '../models/product.model.js';
import { receiptService } from './receipt.service.js';
import { ApiError } from '../utilities/apiError.js';
import { parsePagination, buildPaginationMeta } from '../utilities/pagination.js';
import { env } from '../config/env.js';
import {
  ORDER_STATUS,
  ORDER_STATUS_TRANSITIONS,
  ORDER_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
} from '../utilities/constants.js';

const round = (value) => Number(value.toFixed(2));

class OrderService {
  /**
   * Executes the checkout workflow: resolve line items (from the request body
   * or the customer's cart), snapshot pricing, compute totals, persist the
   * order, generate a receipt, and clear the cart.
   *
   * @returns {Promise<{ order: object, receipt: object }>}
   */
  async create(user, payload) {
    const { fromCart, lineItems } = await this.#resolveLineItems(user.id, payload.items);

    if (lineItems.length === 0) {
      throw ApiError.badRequest('Cannot place an order with no items');
    }

    const subtotal = round(lineItems.reduce((sum, item) => sum + item.subtotal, 0));
    const tax = round(subtotal * env.taxRate);
    const total = round(subtotal + tax);

    const paymentMethod = payload.paymentMethod;
    const paymentStatus =
      paymentMethod === PAYMENT_METHODS.CASH ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PAID;

    const order = await this.#createWithUniqueNumber({
      user: user.id,
      customerName: user.name,
      items: lineItems,
      orderType: payload.orderType || ORDER_TYPES.DINE_IN,
      paymentMethod,
      paymentStatus,
      notes: payload.notes || '',
      subtotal,
      tax,
      total,
    });

    const receipt = await receiptService.createForOrder(order);

    if (fromCart) {
      await Cart.updateOne({ user: user.id }, { $set: { items: [] } });
    }

    return { order, receipt };
  }

  async adminList(query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const filter = this.#buildListFilter(query);

    const direction = query.order === 'asc' ? 1 : -1;
    const sortField = ['createdAt', 'total', 'status'].includes(query.sort)
      ? query.sort
      : 'createdAt';

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email')
        .sort({ [sortField]: direction })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ]);

    return { orders, meta: buildPaginationMeta({ page, limit, total }) };
  }

  async listForCustomer(userId, query = {}) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { ...this.#buildListFilter(query), user: userId };

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    return { orders, meta: buildPaginationMeta({ page, limit, total }) };
  }

  async getById(id) {
    const order = await Order.findById(id).populate('user', 'name email');
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return order;
  }

  async getForCustomer(userId, id) {
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return order;
  }

  async updateStatus(id, status) {
    const order = await Order.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    this.#assertTransition(order.status, status);
    order.status = status;

    if (status === ORDER_STATUS.COMPLETED && order.paymentStatus === PAYMENT_STATUS.PENDING) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
    }

    await order.save();
    return order;
  }

  async updatePaymentStatus(id, paymentStatus) {
    const order = await Order.findById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    order.paymentStatus = paymentStatus;
    await order.save();
    return order;
  }

  /**
   * Customer-initiated cancellation, only permitted while the order is still
   * pending (before the kitchen starts preparing it).
   */
  async cancelForCustomer(userId, id) {
    const order = await this.getForCustomer(userId, id);

    if (order.status !== ORDER_STATUS.PENDING) {
      throw ApiError.badRequest('Only pending orders can be cancelled');
    }

    order.status = ORDER_STATUS.CANCELLED;
    await order.save();
    return order;
  }

  #buildListFilter(query) {
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.orderType) filter.orderType = query.orderType;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;

    if (query.from || query.to) {
      filter.createdAt = {};
      if (query.from) filter.createdAt.$gte = new Date(query.from);
      if (query.to) filter.createdAt.$lte = new Date(query.to);
    }

    if (query.search) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ orderNumber: regex }, { customerName: regex }];
    }

    return filter;
  }

  async #resolveLineItems(userId, explicitItems) {
    if (Array.isArray(explicitItems) && explicitItems.length > 0) {
      const productIds = explicitItems.map((item) => item.productId);
      const products = await Product.find({ _id: { $in: productIds } });
      const productMap = new Map(products.map((product) => [String(product._id), product]));

      const lineItems = explicitItems.map((item) => {
        const product = productMap.get(String(item.productId));
        if (!product) {
          throw ApiError.badRequest(`Product ${item.productId} does not exist`);
        }
        if (!product.isAvailable) {
          throw ApiError.badRequest(`"${product.name}" is currently unavailable`);
        }
        return this.#toLineItem(product, item.quantity);
      });

      return { fromCart: false, lineItems };
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty');
    }

    const lineItems = cart.items.map((item) => {
      if (!item.product) {
        throw ApiError.badRequest('A product in your cart no longer exists');
      }
      if (!item.product.isAvailable) {
        throw ApiError.badRequest(`"${item.product.name}" is currently unavailable`);
      }
      return this.#toLineItem(item.product, item.quantity);
    });

    return { fromCart: true, lineItems };
  }

  #toLineItem(product, quantity) {
    const subtotal = round(product.price * quantity);
    return {
      product: product._id,
      name: product.name,
      price: product.price,
      quantity,
      subtotal,
    };
  }

  #assertTransition(current, next) {
    if (current === next) {
      return;
    }
    const allowed = ORDER_STATUS_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
      throw ApiError.badRequest(`Cannot change order status from "${current}" to "${next}"`);
    }
  }

  async #createWithUniqueNumber(data, attempt = 0) {
    try {
      return await Order.create({ ...data, orderNumber: this.#generateOrderNumber() });
    } catch (error) {
      // Retry a handful of times on the rare orderNumber collision.
      if (error.code === 11000 && attempt < 5) {
        return this.#createWithUniqueNumber(data, attempt + 1);
      }
      throw error;
    }
  }

  #generateOrderNumber() {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `ORD-${datePart}-${random}`;
  }
}

export const orderService = new OrderService();
