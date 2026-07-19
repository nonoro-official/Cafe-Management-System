import api from './api.js';

// --- Real endpoints (already exist on the backend, admin-authorized) ---

export const listOrders = async (params = {}) => {
  const { data } = await api.get('/orders', { params });
  return data; // { success, data: orders[], meta }
};

export const getOrder = async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data.data.order;
};

export const updateOrderStatus = async (id, status) => {
  const { data } = await api.patch(`/orders/${id}/status`, { status });
  return data.data.order;
};

export const updateOrderPayment = async (id, paymentStatus) => {
  const { data } = await api.patch(`/orders/${id}/payment`, { paymentStatus });
  return data.data.order;
};

// --- TODO(backend): no endpoint exists for staff to create an order. ---
// POST /orders is locked to authorize(ROLES.CUSTOMER) only. Placeholder
// aimed at a route that doesn't exist yet so the Register page fails
// gracefully (404) instead of guessing at a real endpoint shape.
export const createRegisterOrder = async (payload) => {
  const { data } = await api.post('/orders/register', payload);
  return data.data.order;
};

// --- TODO(backend): no endpoint exists to edit an order after creation ---
// beyond status/payment. This is aimed at a route that doesn't exist yet
// (`PATCH /orders/:id/notes`) so "Save Changes" on Order Details fails
// gracefully instead of pretending to work.
export const updateOrderNotes = async (id, notes) => {
  const { data } = await api.patch(`/orders/${id}/notes`, { notes });
  return data.data.order;
};
