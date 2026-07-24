import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createKioskOrder } from '../services/orderService.js';

const KioskOrderContext = createContext(undefined);

// Translate the kiosk's UI values into the backend's accepted enums.
const toApiOrderType = (orderType) => (orderType === 'take-out' ? 'takeout' : 'dine-in');
const toApiPaymentMethod = (paymentMethod) => (paymentMethod === 'cash' ? 'cash' : 'cashless');

export const KioskOrderProvider = ({ children }) => {
  const location = useLocation();
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [cart, setCart] = useState({});
  const [orderType, setOrderType] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cashlessProvider, setCashlessProvider] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [ticketNumber, setTicketNumber] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Order type is chosen on the Home screen and passed via router state. Persist
  // it here because later routes (cart, checkout, payment) don't carry state.
  useEffect(() => {
    if (location.state?.orderType) {
      setOrderType(location.state.orderType);
    }
  }, [location.state]);

  const addToCart = useCallback((itemId) => {
    setCart((current) => ({
      ...current,
      [itemId]: (current[itemId] ?? 0) + 1,
    }));
  }, []);

  const removeFromCart = useCallback((itemId) => {
    setCart((current) => {
      const nextQuantity = (current[itemId] ?? 0) - 1;

      if (nextQuantity <= 0) {
        const { [itemId]: _removed, ...rest } = current;
        return rest;
      }

      return { ...current, [itemId]: nextQuantity };
    });
  }, []);

  /**
   * Places the order against the backend kiosk endpoint and stores the
   * server-generated order number (shown to the guest as both the order and
   * ticket reference).
   */
  const submitOrder = useCallback(
    async (method) => {
      const items = Object.entries(cart).map(([productId, quantity]) => ({ productId, quantity }));
      if (items.length === 0) {
        throw new Error('Your cart is empty');
      }

      setSubmitting(true);
      setSubmitError('');
      try {
        const order = await createKioskOrder({
          items,
          paymentMethod: toApiPaymentMethod(method ?? paymentMethod),
          orderType: toApiOrderType(orderType),
        });
        setOrderNumber(order.orderNumber);
        setTicketNumber(order.orderNumber);
        return order;
      } catch (err) {
        const message =
          err?.response?.data?.message || 'We could not place your order. Please try again.';
        setSubmitError(message);
        throw err;
      } finally {
        setSubmitting(false);
      }
    },
    [cart, paymentMethod, orderType],
  );

  const resetOrder = useCallback(() => {
    setCart({});
    setOrderType(null);
    setPaymentMethod(null);
    setCashlessProvider(null);
    setOrderNumber(null);
    setTicketNumber(null);
    setSubmitError('');
    setActiveCategoryId('');
  }, []);

  const cartCount = useMemo(
    () => Object.values(cart).reduce((total, quantity) => total + quantity, 0),
    [cart],
  );

  const value = useMemo(
    () => ({
      orderType,
      activeCategoryId,
      setActiveCategoryId,
      cart,
      cartCount,
      paymentMethod,
      setPaymentMethod,
      cashlessProvider,
      setCashlessProvider,
      orderNumber,
      ticketNumber,
      submitting,
      submitError,
      submitOrder,
      resetOrder,
      addToCart,
      removeFromCart,
    }),
    [
      orderType,
      activeCategoryId,
      cart,
      cartCount,
      paymentMethod,
      cashlessProvider,
      orderNumber,
      ticketNumber,
      submitting,
      submitError,
      submitOrder,
      resetOrder,
      addToCart,
      removeFromCart,
    ],
  );

  return <KioskOrderContext.Provider value={value}>{children}</KioskOrderContext.Provider>;
};

export const useKioskOrder = () => {
  const context = useContext(KioskOrderContext);

  if (!context) {
    throw new Error('useKioskOrder must be used within a KioskOrderProvider');
  }

  return context;
};
