import { Receipt } from '../models/receipt.model.js';
import { ApiError } from '../utilities/apiError.js';
import { env } from '../config/env.js';
import { generateReceiptPdf } from '../utilities/pdfGenerator.js';

class ReceiptService {
  /**
   * Creates the immutable receipt record for a freshly placed order. Called by
   * the order service as the final step of the checkout workflow.
   */
  async createForOrder(order) {
    const receiptNumber = this.#generateReceiptNumber();

    const receipt = await Receipt.create({
      receiptNumber,
      order: order._id,
      orderNumber: order.orderNumber,
      user: order.user,
      customerName: order.customerName,
      orderType: order.orderType,
      paymentMethod: order.paymentMethod,
      items: order.items.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      issuedAt: new Date(),
    });

    return receipt;
  }

  async getByOrderId(orderId) {
    const receipt = await Receipt.findOne({ order: orderId });
    if (!receipt) {
      throw ApiError.notFound('Receipt not found for this order');
    }
    return receipt;
  }

  async getById(id) {
    const receipt = await Receipt.findById(id);
    if (!receipt) {
      throw ApiError.notFound('Receipt not found');
    }
    return receipt;
  }

  /**
   * Renders a receipt to a PDF buffer for download/printing, including the
   * configured business details.
   */
  async renderPdf(receipt) {
    return generateReceiptPdf({
      receiptNumber: receipt.receiptNumber,
      orderNumber: receipt.orderNumber,
      issuedAt: receipt.issuedAt,
      orderType: receipt.orderType,
      paymentMethod: receipt.paymentMethod,
      customerName: receipt.customerName,
      items: receipt.items,
      subtotal: receipt.subtotal,
      tax: receipt.tax,
      total: receipt.total,
      business: env.business,
    });
  }

  #generateReceiptNumber() {
    const date = new Date();
    const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `RCP-${datePart}-${random}`;
  }
}

export const receiptService = new ReceiptService();
