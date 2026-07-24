import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskPageHeader from '../components/kiosk/KioskPageHeader.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

// Served by the backend from server/public/images (mounted at /api/images), so
// the QR can be swapped without rebuilding the kiosk app. The space in the
// filename must be URL-encoded.
const QR_IMAGE_SRC = '/api/images/Cashless%20Method.jpg';

const KioskCashlessPayment = () => {
  const navigate = useNavigate();
  const { cartCount, paymentMethod, setCashlessProvider, submitOrder, submitting, submitError } =
    useKioskOrder();

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

  // QR Ph is the only cashless rail for now. Record it so the order-number
  // page's guard passes once the order is placed.
  useEffect(() => {
    setCashlessProvider('qrph');
  }, [setCashlessProvider]);

  const handleConfirm = async () => {
    if (submitting) {
      return;
    }

    try {
      await submitOrder('cashless');
      navigate('/kiosk/order-number');
    } catch {
      // submitError is surfaced below; the guest stays on this page to retry.
    }
  };

  const handleBack = () => {
    navigate('/kiosk/checkout');
  };

  if (cartCount === 0 || paymentMethod !== 'cashless') {
    return null;
  }

  return (
    <div className="kiosk-cashless kiosk-page">
      <div className="kiosk-cashless__panel">
        <KioskPageHeader
          eyebrow="Cashless"
          title="Scan to pay with QR Ph"
          subtitle="Use any QR Ph-enabled bank or e-wallet app"
        />

        <div className="kiosk-cashless__qr-wrap">
          <img className="kiosk-cashless__qr" src={QR_IMAGE_SRC} alt="QR Ph payment code" />
        </div>

        <p className="kiosk-cashless__hint">
          After paying in your app, tap below to get your order number.
        </p>

        <button
          type="button"
          className="kiosk-btn-primary kiosk-cashless__confirm"
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? 'Placing your order…' : "I've paid — get my order number"}
        </button>

        {submitError && <p className="kiosk-cashless__error">{submitError}</p>}

        <button
          type="button"
          className="kiosk-btn-secondary kiosk-cashless__back"
          onClick={handleBack}
          disabled={submitting}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default KioskCashlessPayment;
