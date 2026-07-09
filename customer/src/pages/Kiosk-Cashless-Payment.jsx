import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { kioskCashlessPaymentMethods } from '../data/kioskPaymentMethods.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KioskCashlessPayment = () => {
  const navigate = useNavigate();
  const { cartCount, paymentMethod, setCashlessProvider, assignOrderNumber } = useKioskOrder();

  useDocumentTitle(`${APP_NAME} | Cashless Payment`);

  useEffect(() => {
    if (cartCount === 0) {
      navigate('/kiosk/dashboard', { replace: true });
      return;
    }

    if (paymentMethod !== 'cashless') {
      navigate('/kiosk/checkout', { replace: true });
    }
  }, [cartCount, paymentMethod, navigate]);

  const handleSelectMethod = (method) => {
    setCashlessProvider(method.id);
    assignOrderNumber();
    navigate('/kiosk/order-number');
  };

  if (cartCount === 0 || paymentMethod !== 'cashless') {
    return null;
  }

  return (
    <div className="kiosk-cashless">
      <div className="kiosk-cashless__content">
        <h1 className="kiosk-cashless__title">Choose your Cashless Payment</h1>

        <div className="kiosk-cashless__grid" role="group" aria-label="Cashless payment methods">
          {kioskCashlessPaymentMethods.map((method) => (
            <button
              key={method.id}
              type="button"
              className="kiosk-cashless__method"
              onClick={() => handleSelectMethod(method)}
              aria-label={`Pay with ${method.label}`}
            >
              {method.image ? (
                <img className="kiosk-cashless__method-image" src={method.image} alt="" />
              ) : (
                <span className="kiosk-cashless__method-placeholder" aria-hidden="true" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KioskCashlessPayment;
