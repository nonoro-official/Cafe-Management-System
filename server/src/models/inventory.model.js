import mongoose from 'mongoose';

/**
 * Supplies/ingredients tracked by the cafe (beans, milk, cups, etc.). This is
 * deliberately separate from sellable `Product`s — inventory is not
 * auto-decremented by sales unless a recipe/BOM is introduced later.
 */
const inventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      maxlength: [120, 'Item name cannot exceed 120 characters'],
    },
    // Free-text "quantity note" shown under the name, e.g. "18 kg on hand".
    sub: {
      type: String,
      trim: true,
      default: '',
      maxlength: [120, 'Quantity note cannot exceed 120 characters'],
    },
    category: {
      type: String,
      trim: true,
      default: '',
      maxlength: [80, 'Category cannot exceed 80 characters'],
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      trim: true,
      uppercase: true,
      unique: true,
      maxlength: [40, 'SKU cannot exceed 40 characters'],
    },
    // Stock level. The admin UI currently treats this as a 0–100 gauge.
    stock: {
      type: Number,
      required: [true, 'Stock level is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    // Valuation per stock unit used for the "Total Asset Value" KPI. Defaults
    // to the UI's historical placeholder multiplier so the KPI stays meaningful
    // until real unit costing is introduced.
    unitValue: {
      type: Number,
      min: [0, 'Unit value cannot be negative'],
      default: 45,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(doc, ret) {
        delete ret._id;
        return ret;
      },
    },
  },
);

inventorySchema.index({ name: 'text', category: 'text', sku: 'text' });

export const Inventory = mongoose.model('Inventory', inventorySchema);
