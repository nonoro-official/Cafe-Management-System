import { useState } from 'react';
import Modal from '../admin/Modal.jsx';
import { formatCurrency, QUICK_CASH_AMOUNTS } from '../../utilities/currency.js';
import { updateOrderPayment } from '../../services/orderService.js';

const METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'cashless', label: 'Cashless (GCash, etc.)' },
];

// order: the order being paid (has _id, total, orderNumber, createdAt, ...)
// onClose(): closes without paying
// onPaid(order): called once payment succeeds, AFTER the success screen is
//   shown and dismissed — RegisterPage navigates away here, OrderDetailsPage
//   just reloads the order in place.
const PaymentModal = ({ order, onClose, onPaid }) => {
  const [stage, setStage] = useState('form'); // 'form' | 'success'
  const [method, setMethod] = useState('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [paidOrder, setPaidOrder] = useState(null);

  const change = method === 'cash' ? Math.max(Number(amountReceived || 0) - order.total, 0) : 0;
  const canComplete = method !== 'cash' || Number(amountReceived || 0) >= order.total;

  const handleQuickCash = (amount) =>
    setAmountReceived((prev) => String((Number(prev) || 0) + amount));
  const handleExact = () => setAmountReceived(String(order.total));

  const handleComplete = async () => {
    setBusy(true);
    setError('');
    try {
      // NOTE(backend): amountReceived isn't a field on the Order model, so
      // it only lives in this component's state for the receipt view below
      const updated = await updateOrderPayment(order._id, 'paid');
      setPaidOrder(updated);
      setStage('success');
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not complete payment.');
    } finally {
      setBusy(false);
    }
  };

  const handlePrintReceipt = () => window.print();

  const handleDone = () => {
    onPaid({ ...paidOrder, _localAmountReceived: amountReceived, _localChange: change });
  };

  if (stage === 'success') {
    return (
      <Modal title="Order Success" onClose={handleDone}>
        <div style={{ textAlign: 'center', padding: '.5rem 0 1.2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--status-good-bg)',
              color: 'var(--status-good-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto .9rem',
              fontSize: '1.6rem',
            }}
          ></div>
          <h3 style={{ margin: '0 0 .4rem' }}>Payment Successful!</h3>
          <p style={{ margin: 0, fontWeight: 600 }}>Order #{paidOrder.orderNumber}</p>
          <p className="cell-sub" style={{ marginTop: '.2rem' }}>
            {new Date(paidOrder.createdAt).toLocaleString('en-PH', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </p>
        </div>

        <div className="form-actions" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-ghost" onClick={handlePrintReceipt}>
            Print Receipt
          </button>
          <button type="button" className="btn btn-primary" onClick={handleDone}>
            Done
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Payment" onClose={onClose}>
      <div className="panel total-amount-panel" style={{ marginBottom: '1rem' }}>
        <div className="register-label">Total Amount</div>
        <div className="kpi-card__value" style={{ fontSize: '1.8rem' }}>
          {formatCurrency(order.total)}
        </div>
      </div>

      <div className="register-label">Payment Method</div>
      <div className="payment-method-grid">
        {METHODS.map((m) => (
          <button
            key={m.value}
            type="button"
            className={`payment-method-btn${method === m.value ? ' is-active' : ''}`}
            onClick={() => setMethod(m.value)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {method === 'cash' && (
        <>
          <div className="register-label">Quick Cash</div>
          <div className="quick-cash-row">
            {QUICK_CASH_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                className="quick-cash-btn"
                onClick={() => handleQuickCash(amount)}
              >
                +{formatCurrency(amount)}
              </button>
            ))}
            <button
              type="button"
              className="quick-cash-btn quick-cash-btn--exact"
              onClick={handleExact}
            >
              Exact
            </button>
          </div>

          <div className="field-group">
            <label htmlFor="modal-amount-received">Amount Received</label>
            <input
              id="modal-amount-received"
              type="number"
              min="0"
              step="0.01"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
            />
          </div>
          <div className="field-group">
            <label htmlFor="modal-change">Change</label>
            <input id="modal-change" value={formatCurrency(change)} readOnly disabled />
          </div>
        </>
      )}

      {error && <div className="form-error">{error}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button
          type="button"
          className="btn btn-primary"
          disabled={busy || !canComplete}
          onClick={handleComplete}
        >
          {busy ? 'Processing...' : 'Complete Payment'}
        </button>
      </div>
    </Modal>
  );
};

export default PaymentModal;
