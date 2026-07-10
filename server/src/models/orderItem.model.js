import mongoose from 'mongoose';

/**
 * Order line item. Prices and names are snapshotted at checkout time so the
 * historical order remains accurate even if the referenced product is later
 * renamed, repriced, or removed.
 */
export const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: true, timestamps: false },
);
