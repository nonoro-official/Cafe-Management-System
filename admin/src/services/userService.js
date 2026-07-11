import api from './api.js';

/**
 * NOTE: the User model only distinguishes role: 'admin' | 'customer' right
 * now (see server/src/utilities/constants.js ROLES). Until the backend adds
 * finer-grained roles (manager / cashier / kitchen) and staff-specific
 * fields (schedule, employee ID format), this treats every 'admin' user as
 * "Staff" for the purposes of this page.
 */
export const listStaff = async (params = {}) => {
  const { data } = await api.get('/users', { params: { role: 'admin', ...params } });
  return data; // { success, data: users[], meta }
};

export const createStaff = async (payload) => {
  const { data } = await api.post('/users', { ...payload, role: 'admin' });
  return data.data.user;
};

export const updateStaff = async (id, payload) => {
  const { data } = await api.put(`/users/${id}`, payload);
  return data.data.user;
};

export const deleteStaff = async (id) => {
  await api.delete(`/users/${id}`);
};
