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

// Staff-placed (point-of-sale) order from the Register screen.
export const createRegisterOrder = async (payload) => {
  const { data } = await api.post('/orders/register', payload);
  return data.data.order;
};

// Edits an order's special instructions (admin-only).
export const updateOrderNotes = async (id, notes) => {
  const { data } = await api.patch(`/orders/${id}/notes`, { notes });
  return data.data.order;
};
