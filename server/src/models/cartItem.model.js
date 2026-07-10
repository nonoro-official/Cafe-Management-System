import mongoose from 'mongoose';

/**
 * Cart line item. Modelled as an embedded subdocument of the Cart so a
 * customer's cart is fetched and mutated atomically, while still referencing
 * the Product via ObjectId for price/name resolution.
 */
export const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { _id: true, timestamps: false },
);
