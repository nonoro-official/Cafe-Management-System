import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../components/admin/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import PaymentModal from '../components/register/PaymentModal.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME, ORDER_STATUS_STEPS } from '../utilities/constants.js';
import { formatCurrency } from '../utilities/currency.js';
import { getOrder, updateOrderStatus, updateOrderNotes } from '../services/orderService.js';

const METHOD_LABEL = { cash: 'Cash', cashless: 'Cashless (GCash, etc.)' };
const NON_DINE_IN_LABEL = { takeout: 'Take-Away' };

const OrderDetailsPage = () => {
  useDocumentTitle(`${APP_NAME} | Order Details`);
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [notesDraft, setNotesDraft] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const localPaymentState = location.state || {};

  useEffect(() => {
    const load = () => {
      setLoading(true);
      setError('');
      getOrder(id)
        .then((o) => {
          setOrder(o);
          setNotesDraft(o.notes || '');
        })
        .catch((err) => setError(err?.response?.data?.message || 'Could not load this order.'))
        .finally(() => setLoading(false));
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setBusy(true);
    try {
      const updated = await updateOrderStatus(id, 'cancelled');
      setOrder(updated);
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Could not cancel this order.');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveChanges = async () => {
    setSaveError('');
    setSaveOk(false);
    setBusy(true);
    try {
      const updated = await updateOrderNotes(id, notesDraft);
      setOrder(updated);
      setSaveOk(true);
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Could not save changes.');
    } finally {
      setBusy(false);
    }
  };

  const handlePaid = (paidOrder) => {
    setShowPayment(false);
    setOrder(paidOrder);
  };

  if (loading) return <LoadingSpinner label="Loading order..." />;
  if (error) return <div className="admin-content form-error">{error}</div>;
  if (!order) return null;

  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = ORDER_STATUS_STEPS.findIndex((s) => s.value === order.status);

  return (
    <>
      <PageHeader
        title="Order Details"
        onBack={() => navigate('/orders')}
        meta={
          <>
            <div>Order #{order.orderNumber}</div>
            <div className="admin-topbar__subtitle">
              {new Date(order.createdAt).toLocaleString('en-PH', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
          </>
        }
      />

      <div className="admin-content order-details-layout">
        <div className="register-order-panel">
          <div className="register-row">
            <div>
              <div className="register-label">Order Type</div>
              <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>{order.orderType}</div>
            </div>
            <div>
              <div className="register-label">
                {order.orderType === 'dine-in' ? 'Table' : 'Order Type Detail'}
              </div>
              <div style={{ fontWeight: 600 }}>
                {order.orderType === 'dine-in'
                  ? order.tableNumber || '—'
                  : NON_DINE_IN_LABEL[order.orderType] || order.orderType}
              </div>
            </div>
            <div>
              <div className="register-label">Customer Name</div>
              <div style={{ fontWeight: 600 }}>{order.customerName || 'Walk-in customer'}</div>
            </div>
            <div>
              <div className="register-label">Customer Number</div>
              <div style={{ fontWeight: 600, color: 'var(--brand-muted)' }}>Not collected</div>
            </div>
          </div>

          <div className="register-label" style={{ marginTop: '1.2rem' }}>
            Items
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item._id}>
                    <td>{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="cart-summary" style={{ marginTop: '1.2rem' }}>
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            <div className="cart-summary__row cart-summary__row--total">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          <div className="register-label" style={{ marginTop: '1.2rem' }}>
            Special Instructions
          </div>
          <textarea
            className="notes-input"
            rows={3}
            value={notesDraft}
            onChange={(e) => setNotesDraft(e.target.value)}
            style={{ resize: 'none' }}
            disabled={isCancelled}
          />
          {saveError && <div className="form-error">{saveError}</div>}
          {saveOk && (
            <p className="cell-sub" style={{ color: 'var(--status-good-text)' }}>
              Saved.
            </p>
          )}

          {order.paymentMethod === 'cash' && localPaymentState.amountReceived != null && (
            <div className="panel" style={{ marginTop: '1rem' }}>
              <h3 style={{ marginTop: 0 }}>Payment</h3>
              <div className="cart-summary__row">
                <span>Method</span>
                <span>{METHOD_LABEL[order.paymentMethod]}</span>
              </div>
              <div className="cart-summary__row">
                <span>Amount Received</span>
                <span>{formatCurrency(localPaymentState.amountReceived)}</span>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <span>Change</span>
                <span>{formatCurrency(localPaymentState.change)}</span>
              </div>
            </div>
          )}

          <div className="register-actions">
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy || isCancelled}
              onClick={handleCancel}
            >
              Cancel Order
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={busy || isCancelled}
              onClick={handleSaveChanges}
            >
              Save Changes
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={isCancelled || order.paymentStatus === 'paid'}
              onClick={() => setShowPayment(true)}
            >
              Proceed to Payment
            </button>
          </div>
        </div>

        <div className="register-cart-panel">
          <div className="panel">
            <h3 style={{ marginTop: 0 }}>Order Status</h3>
            <div className="status-stepper">
              {ORDER_STATUS_STEPS.map((step, index) => (
                <div
                  key={step.value}
                  className={`status-stepper__step${
                    isCancelled ? '' : index <= currentStepIndex ? ' is-complete' : ''
                  }`}
                >
                  <span className="status-stepper__dot" />
                  <div>
                    <div className="status-stepper__label">{step.label}</div>
                    {index === currentStepIndex && !isCancelled && (
                      <div className="status-stepper__time">
                        {new Date(order.updatedAt).toLocaleTimeString('en-PH', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isCancelled && <div className="form-error">This order was cancelled.</div>}
            </div>
          </div>

          <div className="panel" style={{ marginTop: '1rem' }}>
            <h3 style={{ marginTop: 0 }}>Kitchen Ticket</h3>
            {order.items.map((item) => (
              <div key={item._id} className="cart-row">
                <span className="cart-row__name">{item.name}</span>
                <span className="cart-row__total">x{item.quantity}</span>
              </div>
            ))}
            <div className="cell-sub" style={{ marginTop: '.8rem' }}>
              Status: {order.status} ·{' '}
              {new Date(order.updatedAt).toLocaleTimeString('en-PH', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal order={order} onClose={() => setShowPayment(false)} onPaid={handlePaid} />
      )}
    </>
  );
};

export default OrderDetailsPage;
