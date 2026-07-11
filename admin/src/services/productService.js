import api from './api.js';

export const listProducts = async (params = {}) => {
  const { data } = await api.get('/products', { params });
  return data; // { success, data: products[], meta }
};

export const createProduct = async (payload) => {
  const { data } = await api.post('/products', payload);
  return data.data.product;
};

export const updateProduct = async (id, payload) => {
  const { data } = await api.put(`/products/${id}`, payload);
  return data.data.product;
};

export const deleteProduct = async (id) => {
  await api.delete(`/products/${id}`);
};
