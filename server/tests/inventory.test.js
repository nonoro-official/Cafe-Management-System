import { describe, it, expect } from 'vitest';
import { api, registerCustomer, createAdminAndLogin } from './helpers.js';

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

describe('inventory (admin-only)', () => {
  it('forbids non-admins', async () => {
    const { token } = await registerCustomer();
    const res = await api().get('/api/inventory').set(authHeader(token));
    expect(res.status).toBe(403);
  });

  it('supports the full CRUD + summary contract', async () => {
    const token = await createAdminAndLogin();

    const created = await api()
      .post('/api/inventory')
      .set(authHeader(token))
      .send({ name: 'Oat Milk', sub: '6 units on hand', category: 'Dairy Alt.', sku: 'DA-2210', stock: 12 });
    expect(created.status).toBe(201);
    const item = created.body.data.item;
    expect(item.id).toBeTruthy();
    expect(item.sku).toBe('DA-2210');

    // Duplicate SKU is rejected.
    const dup = await api()
      .post('/api/inventory')
      .set(authHeader(token))
      .send({ name: 'Oat Milk 2', sku: 'DA-2210', stock: 5 });
    expect(dup.status).toBeGreaterThanOrEqual(400);

    // List includes the item.
    const list = await api().get('/api/inventory').set(authHeader(token));
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);

    // Summary reflects it (default unitValue 45 -> assetValue = stock * 45).
    const summary = await api().get('/api/inventory/summary').set(authHeader(token));
    expect(summary.status).toBe(200);
    expect(summary.body.data.totalProducts).toBe(1);
    expect(summary.body.data.totalAssetValue).toBe(12 * 45);

    // Update the stock level.
    const updated = await api()
      .put(`/api/inventory/${item.id}`)
      .set(authHeader(token))
      .send({ stock: 80 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.item.stock).toBe(80);

    // Delete it.
    const removed = await api().delete(`/api/inventory/${item.id}`).set(authHeader(token));
    expect(removed.status).toBe(200);

    const empty = await api().get('/api/inventory').set(authHeader(token));
    expect(empty.body.data).toHaveLength(0);
  });
});
