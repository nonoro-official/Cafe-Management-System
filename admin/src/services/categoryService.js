import api from './api.js';

export const listCategories = async (params = {}) => {
  const { data } = await api.get('/categories', { params });
  return data.data; // categories[]
};
