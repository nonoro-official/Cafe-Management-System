/**
 * Development seed script.
 *
 * Creates a bootstrap admin account (from SEED_ADMIN_* env vars), a sample
 * customer, a set of categories, and a menu of products. Safe to re-run: it
 * upserts by natural key and skips anything that already exists.
 *
 *   npm run seed
 */
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utilities/logger.js';
import { User } from '../models/user.model.js';
import { Category } from '../models/category.model.js';
import { Product } from '../models/product.model.js';
import { Inventory } from '../models/inventory.model.js';
import { ROLES } from '../utilities/constants.js';

const categorySeeds = [
  { name: 'Coffee', description: 'Espresso-based and brewed coffees', sortOrder: 1 },
  { name: 'Pastries', description: 'Freshly baked pastries', sortOrder: 2 },
  { name: 'Sandwiches', description: 'Hearty sandwiches', sortOrder: 3 },
  { name: 'Salads', description: 'Fresh, healthy salads', sortOrder: 4 },
  { name: 'Desserts', description: 'Sweet treats', sortOrder: 5 },
];

const productSeeds = {
  Coffee: [
    { name: 'Espresso', price: 2.5, tags: ['hot', 'classic'] },
    { name: 'Cappuccino', price: 3.75, tags: ['hot', 'milk'] },
    { name: 'Caffe Latte', price: 4.0, tags: ['hot', 'milk'] },
    { name: 'Iced Americano', price: 3.5, tags: ['cold'] },
    { name: 'Cold Brew', price: 4.25, tags: ['cold'] },
  ],
  Pastries: [
    { name: 'Butter Croissant', price: 3.0, tags: ['baked'] },
    { name: 'Pain au Chocolat', price: 3.5, tags: ['baked', 'chocolate'] },
    { name: 'Blueberry Muffin', price: 3.25, tags: ['baked'] },
  ],
  Sandwiches: [
    { name: 'Turkey Club', price: 7.5, tags: ['savory'] },
    { name: 'Caprese Panini', price: 7.0, tags: ['vegetarian'] },
  ],
  Salads: [
    { name: 'Caesar Salad', price: 6.5, tags: ['fresh'] },
    { name: 'Greek Salad', price: 6.75, tags: ['fresh', 'vegetarian'] },
  ],
  Desserts: [
    { name: 'Cheesecake Slice', price: 4.5, tags: ['sweet'] },
    { name: 'Chocolate Brownie', price: 3.75, tags: ['sweet', 'chocolate'] },
  ],
};

const seedAdmin = async () => {
  const existing = await User.findOne({ email: env.seed.adminEmail });
  if (existing) {
    logger.info(`Admin already exists: ${env.seed.adminEmail}`);
    return;
  }

  await User.create({
    name: env.seed.adminName,
    email: env.seed.adminEmail,
    password: env.seed.adminPassword,
    role: ROLES.ADMIN,
  });
  logger.info(`Created admin: ${env.seed.adminEmail}`);
};

const seedCustomer = async () => {
  const email = 'customer@cafe.test';
  const existing = await User.findOne({ email });
  if (existing) {
    logger.info(`Sample customer already exists: ${email}`);
    return;
  }

  await User.create({
    name: 'Sample Customer',
    email,
    password: 'Customer123!',
    role: ROLES.CUSTOMER,
  });
  logger.info(`Created sample customer: ${email}`);
};

const seedKiosk = async () => {
  const existing = await User.findOne({ email: env.seed.kioskEmail });
  if (existing) {
    logger.info(`Kiosk account already exists: ${env.seed.kioskEmail}`);
    return;
  }

  // Walk-up kiosk orders are attributed to this shared customer-role account.
  await User.create({
    name: env.seed.kioskName,
    email: env.seed.kioskEmail,
    password: env.seed.kioskPassword,
    role: ROLES.CUSTOMER,
  });
  logger.info(`Created kiosk account: ${env.seed.kioskEmail}`);
};

const inventorySeeds = [
  { name: 'Ethiopia Yirgacheffe Beans', sub: '18 kg on hand', category: 'Coffee', sku: 'CF-1042', stock: 72 },
  { name: 'Oat Milk (1L)', sub: '6 units on hand', category: 'Dairy Alt.', sku: 'DA-2210', stock: 12 },
  { name: 'Vanilla Syrup (750ml)', sub: '2 bottles on hand', category: 'Syrups', sku: 'SY-0087', stock: 8 },
  { name: 'Paper Cups 12oz', sub: '340 pcs on hand', category: 'Packaging', sku: 'PK-1180', stock: 34 },
  { name: 'Croissant Dough (Frozen)', sub: '61 units on hand', category: 'Bakery', sku: 'BK-3305', stock: 61 },
];

const seedInventory = async () => {
  for (const seed of inventorySeeds) {
    const exists = await Inventory.findOne({ sku: seed.sku });
    if (!exists) {
      await Inventory.create(seed);
    }
  }
  logger.info('Inventory seeded');
};

const seedCatalog = async () => {
  for (const seed of categorySeeds) {
    let category = await Category.findOne({ name: seed.name });
    if (!category) {
      category = await Category.create(seed);
      logger.info(`Created category: ${seed.name}`);
    }

    for (const product of productSeeds[seed.name] || []) {
      const exists = await Product.findOne({ name: product.name, category: category._id });
      if (!exists) {
        await Product.create({ ...product, category: category._id });
      }
    }
  }
  logger.info('Catalog seeded');
};

const run = async () => {
  try {
    await connectDatabase();
    await seedAdmin();
    await seedCustomer();
    await seedKiosk();
    await seedCatalog();
    await seedInventory();
    logger.info('Seeding complete');
  } catch (error) {
    logger.error('Seeding failed', { message: error.message });
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
