import { Order } from '../models/order.model.js';
import { Product } from '../models/product.model.js';
import { User } from '../models/user.model.js';
import { ORDER_STATUS, ROLES } from '../utilities/constants.js';

class ReportService {
  /**
   * High-level sales report over an optional date range. Cancelled orders are
   * excluded from revenue figures.
   */
  async getSalesReport(query = {}) {
    const match = this.#buildMatch(query);

    const [totalsAgg, byStatus, byPaymentMethod, byOrderType] = await Promise.all([
      Order.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            orders: { $sum: 1 },
            revenue: { $sum: '$total' },
            itemsSold: { $sum: { $sum: '$items.quantity' } },
          },
        },
      ]),
      Order.aggregate([
        { $match: this.#buildMatch(query, { includeCancelled: true }) },
        { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: match },
        { $group: { _id: '$orderType', count: { $sum: 1 }, revenue: { $sum: '$total' } } },
      ]),
    ]);

    const totals = totalsAgg[0] || { orders: 0, revenue: 0, itemsSold: 0 };
    const averageOrderValue = totals.orders > 0 ? totals.revenue / totals.orders : 0;

    return {
      range: this.#describeRange(query),
      totals: {
        orders: totals.orders,
        revenue: Number(totals.revenue.toFixed(2)),
        itemsSold: totals.itemsSold,
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
      },
      byStatus: this.#keyBy(byStatus),
      byPaymentMethod: this.#keyBy(byPaymentMethod),
      byOrderType: this.#keyBy(byOrderType),
    };
  }

  /**
   * Best-selling products ranked by quantity sold.
   */
  async getTopProducts(query = {}) {
    const match = this.#buildMatch(query);
    const limit = Math.min(Number(query.limit) || 10, 50);

    const results = await Order.aggregate([
      { $match: match },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          quantitySold: { $sum: '$items.quantity' },
          revenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { quantitySold: -1 } },
      { $limit: limit },
    ]);

    return results.map((row) => ({
      productId: row._id,
      name: row.name,
      quantitySold: row.quantitySold,
      revenue: Number(row.revenue.toFixed(2)),
    }));
  }

  /**
   * Daily revenue and order counts, useful for charting sales trends.
   */
  async getSalesTrend(query = {}) {
    const match = this.#buildMatch(query);

    const results = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return results.map((row) => ({
      date: row._id,
      orders: row.orders,
      revenue: Number(row.revenue.toFixed(2)),
    }));
  }

  /**
   * Snapshot counters for the admin dashboard landing page.
   */
  async getDashboardOverview() {
    const [productCount, customerCount, sales] = await Promise.all([
      Product.countDocuments(),
      User.countDocuments({ role: ROLES.CUSTOMER }),
      this.getSalesReport(),
    ]);

    return {
      products: productCount,
      customers: customerCount,
      orders: sales.totals.orders,
      revenue: sales.totals.revenue,
      pendingOrders: sales.byStatus[ORDER_STATUS.PENDING]?.count || 0,
    };
  }

  #buildMatch(query, { includeCancelled = false } = {}) {
    const match = {};

    if (!includeCancelled) {
      match.status = { $ne: ORDER_STATUS.CANCELLED };
    }

    if (query.from || query.to) {
      match.createdAt = {};
      if (query.from) match.createdAt.$gte = new Date(query.from);
      if (query.to) match.createdAt.$lte = new Date(query.to);
    }

    return match;
  }

  #describeRange(query) {
    return {
      from: query.from ? new Date(query.from).toISOString() : null,
      to: query.to ? new Date(query.to).toISOString() : null,
    };
  }

  #keyBy(rows) {
    return rows.reduce((acc, row) => {
      acc[row._id] = { count: row.count, revenue: Number((row.revenue || 0).toFixed(2)) };
      return acc;
    }, {});
  }
}

export const reportService = new ReportService();
