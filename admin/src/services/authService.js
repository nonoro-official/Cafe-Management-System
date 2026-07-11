import api from './api.js';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data.data.user;
};

export const logout = async () => {
  await api.post('/auth/logout');
};

export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};
