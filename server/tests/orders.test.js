import { describe, it, expect } from 'vitest';
import {
  api,
  registerCustomer,
  createAdminAndLogin,
  ensureKioskUser,
  seedProduct,
} from './helpers.js';

describe('products & categories (public)', () => {
  it('lists available products and categories', async () => {
    await seedProduct({ name: 'Espresso', price: 3 });

    const products = await api().get('/api/products');
    expect(products.status).toBe(200);
    expect(products.body.data).toHaveLength(1);
    expect(products.body.data[0].name).toBe('Espresso');

    const categories = await api().get('/api/categories');
    expect(categories.status).toBe(200);
    expect(categories.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('kiosk orders (public)', () => {
  it('rejects a kiosk order when the kiosk account is missing', async () => {
    const { product } = await seedProduct();
    const res = await api()
      .post('/api/orders/kiosk')
      .send({ items: [{ productId: product.id, quantity: 2 }], paymentMethod: 'cash' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('places a kiosk order attributed to the kiosk account', async () => {
    await ensureKioskUser();
    const { product } = await seedProduct({ price: 4 });

    const res = await api()
      .post('/api/orders/kiosk')
      .send({
        items: [{ productId: product.id, quantity: 2 }],
        paymentMethod: 'cash',
        orderType: 'dine-in',
      });

    expect(res.status).toBe(201);
    const { order } = res.body.data;
    expect(order.orderNumber).toMatch(/^ORD-/);
    expect(order.status).toBe('pending');
    expect(order.paymentStatus).toBe('pending'); // cash is paid later
    expect(order.items).toHaveLength(1);
    expect(order.subtotal).toBe(8);
  });

  it('rejects a kiosk order for an unavailable product', async () => {
    await ensureKioskUser();
    const { product } = await seedProduct({ isAvailable: false });

    const res = await api()
      .post('/api/orders/kiosk')
      .send({ items: [{ productId: product.id, quantity: 1 }], paymentMethod: 'cashless' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('customer orders', () => {
  it('requires authentication', async () => {
    const { product } = await seedProduct();
    const res = await api()
      .post('/api/orders')
      .send({ items: [{ productId: product.id, quantity: 1 }], paymentMethod: 'cashless' });
    expect(res.status).toBe(401);
  });

  it('lets an authenticated customer place an order', async () => {
    const { token } = await registerCustomer();
    const { product } = await seedProduct({ price: 5 });

    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, quantity: 3 }], paymentMethod: 'cashless' });

    expect(res.status).toBe(201);
    expect(res.body.data.order.subtotal).toBe(15);
    expect(res.body.data.order.paymentStatus).toBe('paid'); // cashless paid up front
  });
});

describe('admin register orders & status transitions', () => {
  it('creates a staff order with a table number and advances its status', async () => {
    const token = await createAdminAndLogin();
    const { product } = await seedProduct();

    const created = await api()
      .post('/api/orders/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderType: 'dine-in',
        tableNumber: '5',
        customerName: 'Walk-in',
        items: [{ productId: product.id, quantity: 1 }],
        status: 'preparing',
      });

    expect(created.status).toBe(201);
    expect(created.body.data.order.tableNumber).toBe('5');
    expect(created.body.data.order.status).toBe('preparing');

    const id = created.body.data.order._id;

    const advanced = await api()
      .patch(`/api/orders/${id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'ready' });
    expect(advanced.status).toBe(200);
    expect(advanced.body.data.order.status).toBe('ready');
  });

  it('rejects an illegal status transition', async () => {
    await ensureKioskUser();
    const adminToken = await createAdminAndLogin();
    const { product } = await seedProduct();

    // Kiosk order starts as pending.
    const created = await api()
      .post('/api/orders/kiosk')
      .send({ items: [{ productId: product.id, quantity: 1 }], paymentMethod: 'cash' });
    const id = created.body.data.order._id;

    // pending -> ready is not allowed (must go through preparing).
    const res = await api()
      .patch(`/api/orders/${id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ready' });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('forbids non-admins from creating register orders', async () => {
    const { token } = await registerCustomer();
    const { product } = await seedProduct();
    const res = await api()
      .post('/api/orders/register')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [{ productId: product.id, quantity: 1 }] });
    expect(res.status).toBe(403);
  });
});

describe('edit order notes', () => {
  const placeKioskOrder = async () => {
    await ensureKioskUser();
    const { product } = await seedProduct();
    const created = await api()
      .post('/api/orders/kiosk')
      .send({ items: [{ productId: product.id, quantity: 1 }], paymentMethod: 'cash' });
    return created.body.data.order._id;
  };

  it("lets an admin edit an order's notes", async () => {
    const id = await placeKioskOrder();
    const token = await createAdminAndLogin();

    const res = await api()
      .patch(`/api/orders/${id}/notes`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'Extra hot, no sugar' });

    expect(res.status).toBe(200);
    expect(res.body.data.order.notes).toBe('Extra hot, no sugar');
  });

  it('rejects notes longer than 500 characters', async () => {
    const id = await placeKioskOrder();
    const token = await createAdminAndLogin();

    const res = await api()
      .patch(`/api/orders/${id}/notes`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'x'.repeat(501) });

    expect(res.status).toBe(422);
  });

  it('forbids a non-admin from editing notes', async () => {
    const id = await placeKioskOrder();
    const { token } = await registerCustomer();

    const res = await api()
      .patch(`/api/orders/${id}/notes`)
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'hello' });

    expect(res.status).toBe(403);
  });

  it('returns 404 for a non-existent order', async () => {
    const token = await createAdminAndLogin();

    const res = await api()
      .patch('/api/orders/507f1f77bcf86cd799439011/notes')
      .set('Authorization', `Bearer ${token}`)
      .send({ notes: 'hello' });

    expect(res.status).toBe(404);
  });
});
