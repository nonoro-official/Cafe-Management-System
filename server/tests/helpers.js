import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/user.model.js';
import { Category } from '../src/models/category.model.js';
import { Product } from '../src/models/product.model.js';
import { env } from '../src/config/env.js';
import { ROLES } from '../src/utilities/constants.js';

export const api = () => request(app);

const PASSWORD = 'Password1';

export const registerCustomer = async (overrides = {}) => {
  const payload = {
    name: 'Test Customer',
    email: 'customer@test.io',
    password: PASSWORD,
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { res, token: res.body?.data?.token, user: res.body?.data?.user };
};

export const createAdminAndLogin = async () => {
  const email = 'admin@test.io';
  await User.create({ name: 'Admin', email, password: PASSWORD, role: ROLES.ADMIN });
  const res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
  return res.body.data.token;
};

// The kiosk order endpoint attributes orders to the seeded kiosk account.
export const ensureKioskUser = () =>
  User.create({
    name: env.seed.kioskName,
    email: env.seed.kioskEmail,
    password: PASSWORD,
    role: ROLES.CUSTOMER,
  });

export const seedProduct = async (overrides = {}) => {
  const category = await Category.create({
    name: overrides.categoryName || `Category ${Math.random().toString(36).slice(2, 8)}`,
    sortOrder: 1,
  });
  const product = await Product.create({
    name: overrides.name || 'Caffe Latte',
    price: overrides.price ?? 4,
    category: category._id,
    isAvailable: overrides.isAvailable ?? true,
  });
  return { category, product };
};
