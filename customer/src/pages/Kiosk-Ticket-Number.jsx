import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskNumberDisplay from '../components/kiosk/KioskNumberDisplay.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KioskTicketNumber = () => {
  const navigate = useNavigate();
  const { cartCount, paymentMethod, ticketNumber, submitOrder, submitting, submitError, resetOrder } =
    useKioskOrder();
  const submittedRef = useRef(false);

  useDocumentTitle(`${APP_NAME} | Ticket`);

  useEffect(() => {
    if (cartCount === 0) {
      navigate('/kiosk/dashboard', { replace: true });
      return;
    }

    if (paymentMethod !== 'cash') {
      navigate('/kiosk/checkout', { replace: true });
      return;
    }

    // Submit the cash order exactly once on arrival (guard against the
    // StrictMode double-invoke in development).
    if (!ticketNumber && !submittedRef.current) {
      submittedRef.current = true;
      submitOrder('cash').catch(() => {
        submittedRef.current = false;
      });
    }
  }, [cartCount, paymentMethod, ticketNumber, submitOrder, navigate]);

  const handleNewOrder = () => {
    resetOrder();
    navigate('/kiosk/start');
  };

  if (cartCount === 0 || paymentMethod !== 'cash') {
    return null;
  }

  if (submitting || (!ticketNumber && !submitError)) {
    return (
      <div className="kiosk-confirmation kiosk-page">
        <div className="kiosk-confirmation__panel">
          <p className="kiosk-confirmation__status">Placing your order…</p>
        </div>
      </div>
    );
  }

  if (submitError) {
    return (
      <div className="kiosk-confirmation kiosk-page">
        <div className="kiosk-confirmation__panel">
          <p className="kiosk-confirmation__status">Something went wrong</p>
          <p className="kiosk-confirmation__message">{submitError}</p>
          <button
            type="button"
            className="kiosk-btn-primary kiosk-confirmation__action"
            onClick={() => {
              submittedRef.current = true;
              submitOrder('cash').catch(() => {
                submittedRef.current = false;
              });
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="kiosk-confirmation kiosk-page">
      <div className="kiosk-confirmation__panel">
        <p className="kiosk-confirmation__status">Almost there</p>
        <KioskNumberDisplay label="Ticket" number={ticketNumber} />
        <p className="kiosk-confirmation__message">
          Please provide your ticket at the checkout counter to complete your order.
        </p>
        <button type="button" className="kiosk-btn-primary kiosk-confirmation__action" onClick={handleNewOrder}>
          Start new order
        </button>
      </div>
    </div>
  );
};

export default KioskTicketNumber;
