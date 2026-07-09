import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const PAYMENT_OPTIONS = [
  {
    id: 'cashless',
    label: 'Pay cashless',
    route: '/kiosk/cashless-payment',
  },
  {
    id: 'cash',
    label: 'Pay at the counter (cash)',
    route: '/kiosk/ticket-number',
  },
];

const KioskCheckout = () => {
  const navigate = useNavigate();
  const { cartCount, setPaymentMethod } = useKioskOrder();

  useDocumentTitle(`${APP_NAME} | Payment`);

  useEffect(() => {
    if (cartCount === 0) {
      navigate('/kiosk/dashboard', { replace: true });
    }
  }, [cartCount, navigate]);

  const handleSelectPayment = (option) => {
    setPaymentMethod(option.id);
    navigate(option.route);
  };

  if (cartCount === 0) {
    return null;
  }

  return (
    <div className="kiosk-checkout">
      <div className="kiosk-checkout__content">
        <h1 className="kiosk-checkout__title">How would you like to pay?</h1>

        <div className="kiosk-checkout__options" role="group" aria-label="Payment options">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="kiosk-checkout__option"
              onClick={() => handleSelectPayment(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KioskCheckout;
