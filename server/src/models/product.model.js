import mongoose from 'mongoose';
import { slugify } from '../utilities/slugify.js';
import { resolveImageLoc } from '../utilities/imageLocator.js';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// `imageLoc` is derived from the item name at read time (see imageLocator) so
// images are managed by dropping named files into server/public/images/products
// rather than storing paths in the DB.
productSchema.virtual('imageLoc').get(function getImageLoc() {
  return resolveImageLoc('products', this.name);
});

// Text index powers keyword search across the most relevant fields.
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

productSchema.pre('validate', function setSlug(next) {
  if (this.isModified('name') || !this.slug) {
    const base = slugify(this.name);
    // Append a short random suffix to keep slugs unique across similar names.
    this.slug = this.isNew || !this.slug ? `${base}-${Date.now().toString(36).slice(-4)}` : base;
  }
  next();
});

export const Product = mongoose.model('Product', productSchema);
