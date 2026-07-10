import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskNumberDisplay from '../components/kiosk/KioskNumberDisplay.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KioskOrderNumber = () => {
  const navigate = useNavigate();
  const { cartCount, paymentMethod, cashlessProvider, orderNumber, resetOrder } = useKioskOrder();

  useDocumentTitle(`${APP_NAME} | Order Received`);

  useEffect(() => {
    if (cartCount === 0) {
      navigate('/kiosk/dashboard', { replace: true });
      return;
    }

    if (paymentMethod !== 'cashless' || !cashlessProvider || !orderNumber) {
      navigate('/kiosk/checkout', { replace: true });
    }
  }, [cartCount, paymentMethod, cashlessProvider, orderNumber, navigate]);

  const handleNewOrder = () => {
    resetOrder();
    navigate('/kiosk/start');
  };

  if (cartCount === 0 || paymentMethod !== 'cashless' || !cashlessProvider || !orderNumber) {
    return null;
  }

  return (
    <div className="kiosk-confirmation kiosk-page">
      <div className="kiosk-confirmation__panel">
        <p className="kiosk-confirmation__status">Order received</p>
        <KioskNumberDisplay label="Order" number={orderNumber} />
        <p className="kiosk-confirmation__message">
          Your order has been received. Please watch the counter monitor for your number.
        </p>
        <button type="button" className="kiosk-btn-primary kiosk-confirmation__action" onClick={handleNewOrder}>
          Start new order
        </button>
      </div>
    </div>
  );
};

export default KioskOrderNumber;
