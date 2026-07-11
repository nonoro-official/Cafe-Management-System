import api from './api.js';

export const getSalesReport = async (params = {}) => {
  const { data } = await api.get('/reports/sales', { params });
  return data.data;
};

export const getDashboardOverview = async () => {
  const { data } = await api.get('/reports/overview');
  return data.data;
};

export const getTopProducts = async (params = {}) => {
  const { data } = await api.get('/reports/top-products', { params });
  return data.data;
};

export const getSalesTrend = async (params = {}) => {
  const { data } = await api.get('/reports/sales-trend', { params });
  return data.data;
};
