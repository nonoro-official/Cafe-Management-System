import api from './api.js';

/**
 * Fetches the menu from the backend. Categories and available products are
 * public endpoints, so the kiosk needs no authentication to browse.
 */
export const getCategories = async () => {
  const { data } = await api.get('/categories', { params: { limit: 100 } });
  return data.data;
};

export const getProducts = async () => {
  const { data } = await api.get('/products', { params: { limit: 100, available: true } });
  return data.data;
};
