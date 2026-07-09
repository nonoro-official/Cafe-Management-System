import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskNumberDisplay from '../components/kiosk/KioskNumberDisplay.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KioskOrderNumber = () => {
  const navigate = useNavigate();
  const { cartCount, paymentMethod, cashlessProvider, orderNumber } = useKioskOrder();

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

  if (cartCount === 0 || paymentMethod !== 'cashless' || !cashlessProvider || !orderNumber) {
    return null;
  }

  return (
    <div className="kiosk-confirmation">
      <KioskNumberDisplay label="Order" number={orderNumber} />

      <p className="kiosk-confirmation__message">
        Your order has been received. Please watch the counter monitor for your number.
      </p>
    </div>
  );
};

export default KioskOrderNumber;
