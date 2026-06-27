import api from './api.js';

export const fetchHealthStatus = async () => {
  const { data } = await api.get('/health');
  return data;
};
