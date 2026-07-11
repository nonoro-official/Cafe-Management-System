import api from './api.js';

export const inventoryService = {
  list: (params) => api.get('/inventory', { params }).then((res) => res.data),
  summary: () => api.get('/inventory/summary').then((res) => res.data),
  remove: (id) => api.delete(`/inventory/${id}`),
  create: (payload) => api.post('/inventory', payload).then((res) => res.data),
  update: (id, payload) => api.put(`/inventory/${id}`, payload).then((res) => res.data),
};
