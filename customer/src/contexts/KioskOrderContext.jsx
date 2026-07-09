import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { kioskCategories } from '../data/kioskMenu.js';
import { createKioskReferenceNumber } from '../utilities/kioskReferenceNumber.js';

const KioskOrderContext = createContext(undefined);

export const KioskOrderProvider = ({ children }) => {
  const location = useLocation();
  const [activeCategoryId, setActiveCategoryId] = useState(kioskCategories[0]?.id ?? '');
  const [cart, setCart] = useState({});
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [cashlessProvider, setCashlessProvider] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);
  const [ticketNumber, setTicketNumber] = useState(null);

  const orderType = location.state?.orderType ?? null;

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

  const assignOrderNumber = useCallback(() => {
    const nextNumber = createKioskReferenceNumber();
    setOrderNumber(nextNumber);
    return nextNumber;
  }, []);

  const assignTicketNumber = useCallback(() => {
    const nextNumber = createKioskReferenceNumber();
    setTicketNumber(nextNumber);
    return nextNumber;
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
      assignOrderNumber,
      assignTicketNumber,
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
      assignOrderNumber,
      assignTicketNumber,
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
