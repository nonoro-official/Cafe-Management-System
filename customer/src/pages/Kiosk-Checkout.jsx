import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskPageHeader from '../components/kiosk/KioskPageHeader.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const PAYMENT_OPTIONS = [
  {
    id: 'cashless',
    label: 'Pay cashless',
    hint: 'Scan QR Ph to pay',
    icon: '💳',
    route: '/kiosk/cashless-payment',
  },
  {
    id: 'cash',
    label: 'Pay at the counter',
    hint: 'Cash payment with ticket',
    icon: '💵',
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
    <div className="kiosk-checkout kiosk-page">
      <div className="kiosk-checkout__panel">
        <KioskPageHeader
          eyebrow="Payment"
          title="How would you like to pay?"
          subtitle="Select your preferred payment method"
        />

        <div className="kiosk-checkout__options" role="group" aria-label="Payment options">
          {PAYMENT_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="kiosk-checkout__option"
              onClick={() => handleSelectPayment(option)}
            >
              <span className="kiosk-checkout__option-icon" aria-hidden="true">
                {option.icon}
              </span>
              <span className="kiosk-checkout__option-copy">
                <span className="kiosk-checkout__option-label">{option.label}</span>
                <span className="kiosk-checkout__option-hint">{option.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KioskCheckout;
