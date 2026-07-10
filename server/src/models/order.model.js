import mongoose from 'mongoose';
import { orderItemSchema } from './orderItem.model.js';
import {
  ORDER_STATUS,
  ORDER_STATUS_VALUES,
  ORDER_TYPES,
  ORDER_TYPE_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS,
  PAYMENT_STATUS_VALUES,
} from '../utilities/constants.js';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      default: '',
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'An order must contain at least one item',
      },
    },
    orderType: {
      type: String,
      enum: ORDER_TYPE_VALUES,
      default: ORDER_TYPES.DINE_IN,
    },
    status: {
      type: String,
      enum: ORDER_STATUS_VALUES,
      default: ORDER_STATUS.PENDING,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: PAYMENT_METHOD_VALUES,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: PAYMENT_STATUS_VALUES,
      default: PAYMENT_STATUS.PENDING,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
