import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskCartItemRow from '../components/kiosk/KioskCartItemRow.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { getMenuItemById } from '../data/kioskMenu.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KioskCart = () => {
  const navigate = useNavigate();
  const { cart, cartCount, addToCart, removeFromCart } = useKioskOrder();

  useDocumentTitle(`${APP_NAME} | Your Orders`);

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([itemId, quantity]) => {
          const item = getMenuItemById(itemId);

          if (!item) {
            return null;
          }

          return { item, quantity };
        })
        .filter(Boolean),
    [cart],
  );

  const cartTotal = useMemo(
    () => cartLines.reduce((total, { item, quantity }) => total + (item.price ?? 0) * quantity, 0),
    [cartLines],
  );

  useEffect(() => {
    if (cartCount === 0) {
      navigate('/kiosk/dashboard', { replace: true });
    }
  }, [cartCount, navigate]);

  const handleBack = () => {
    navigate('/kiosk/dashboard');
  };

  const handleProceedToPayment = () => {
    navigate('/kiosk/checkout');
  };

  if (cartCount === 0) {
    return null;
  }

  return (
    <div className="kiosk-cart">
      <header className="kiosk-cart__header">
        <h1 className="kiosk-cart__title">Your Orders</h1>
      </header>

      <div className="kiosk-cart__list-wrap">
        <ul className="kiosk-cart__list">
          {cartLines.map(({ item, quantity }) => (
            <li key={item.id}>
              <KioskCartItemRow
                item={item}
                quantity={quantity}
                onAdd={() => addToCart(item.id)}
                onRemove={() => removeFromCart(item.id)}
              />
            </li>
          ))}
        </ul>
      </div>

      <footer className="kiosk-cart__footer">
        <div className="kiosk-cart__total">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>

        <div className="kiosk-cart__actions">
          <button type="button" className="kiosk-cart__back" onClick={handleBack}>
            Back
          </button>
          <button
            type="button"
            className="kiosk-cart__proceed"
            onClick={handleProceedToPayment}
          >
            Proceed to payment
          </button>
        </div>
      </footer>
    </div>
  );
};

export default KioskCart;
