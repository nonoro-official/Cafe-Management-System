import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import KioskNumberDisplay from '../components/kiosk/KioskNumberDisplay.jsx';
import { useKioskOrder } from '../contexts/KioskOrderContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KioskTicketNumber = () => {
  const navigate = useNavigate();
  const { cartCount, paymentMethod, ticketNumber, assignTicketNumber, resetOrder } = useKioskOrder();

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

    if (!ticketNumber) {
      assignTicketNumber();
    }
  }, [cartCount, paymentMethod, ticketNumber, assignTicketNumber, navigate]);

  const handleNewOrder = () => {
    resetOrder();
    navigate('/kiosk/start');
  };

  if (cartCount === 0 || paymentMethod !== 'cash' || !ticketNumber) {
    return null;
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
