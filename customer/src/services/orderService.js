import api from './api.js';

/**
 * Submits a walk-up kiosk order to the public kiosk endpoint. Returns the
 * created order, whose server-generated `orderNumber` is shown to the guest.
 */
export const createKioskOrder = async ({ items, paymentMethod, orderType }) => {
  const { data } = await api.post('/orders/kiosk', { items, paymentMethod, orderType });
  return data.data.order;
};
