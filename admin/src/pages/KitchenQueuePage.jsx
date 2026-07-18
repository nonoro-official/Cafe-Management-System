import { useEffect, useState } from 'react';
import PageHeader from '../components/admin/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';
import { listOrders, updateOrderStatus } from '../services/orderService.js';

const urgencyFor = (mins, kind) => {
  if (kind === 'preparing') {
    if (mins >= 10) return 'urgent';
    if (mins >= 5) return 'warn';
    return 'normal';
  }
  return mins >= 6 ? 'warn' : 'normal';
};

const Ticket = ({ order, kind, onAdvance, busy }) => {
  const [mins, setMins] = useState(null);

  useEffect(() => {
    const tick = () => {
      setMins(Math.max(0, Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)));
    };
    tick();
    const interval = setInterval(tick, 15000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const urgency = urgencyFor(mins ?? 0, kind);
  const typeLabel =
    order.orderType === 'dine-in'
      ? `🍽️ Table ${order.tableNumber || '—'}`
      : `🥡 ${order.customerName || 'Take-Away'}`;

  return (
    <div className={`ticket${urgency !== 'normal' ? ` ticket--${urgency}` : ''}`}>
      <div className="ticket-top">
        <span className="oc-num">#{order.orderNumber}</span>
        <span className="cell-sub">{typeLabel}</span>
        <span className={`elapsed-chip elapsed-chip--${urgency}`}>
          {mins === null ? '—' : `${mins} min`}
        </span>
      </div>
      <ul className="ticket-items">
        {order.items.map((item) => (
          <li key={item._id}>
            <span>{item.quantity}×</span>
            {item.name}
          </li>
        ))}
      </ul>
      {kind === 'preparing' ? (
        <button type="button" className="btn btn-primary full" disabled={busy} onClick={onAdvance}>
          Mark Ready →
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-primary full btn-picked-up"
          disabled={busy}
          onClick={onAdvance}
        >
          Picked Up ✓
        </button>
      )}
    </div>
  );
};

const KitchenQueuePage = () => {
  useDocumentTitle(`${APP_NAME} | Kitchen Display`);
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    listOrders({ limit: 100, sort: 'createdAt', order: 'asc' })
      .then((res) => setOrders(res.data.filter((o) => ['preparing', 'ready'].includes(o.status))))
      .catch((err) =>
        setError(err?.response?.data?.message || 'Could not load the kitchen display.'),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const start = () => {
      setLoading(true);
      setError('');
      load();
    };
    start();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, []);

  const preparing = orders.filter((o) => o.status === 'preparing');
  const ready = orders.filter((o) => o.status === 'ready');

  const handleAdvance = async (order, nextStatus) => {
    setBusyId(order._id);
    try {
      await updateOrderStatus(order._id, nextStatus);
      load();
    } catch (err) {
      window.alert(err?.response?.data?.message || 'Could not update this order.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Back of House"
        title="Kitchen Display"
        subtitle={`Hot Line · ${user?.name || 'Kitchen Staff'}`}
      />
      <div className="admin-content">
        {loading ? (
          <LoadingSpinner label="Loading tickets..." />
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : (
          <div className="kds-cols">
            <div>
              <h3 className="kds-col-title">Preparing</h3>
              {preparing.length === 0 ? (
                <p className="empty-state">No orders in prep.</p>
              ) : (
                preparing.map((o) => (
                  <Ticket
                    key={o._id}
                    order={o}
                    kind="preparing"
                    busy={busyId === o._id}
                    onAdvance={() => handleAdvance(o, 'ready')}
                  />
                ))
              )}
            </div>
            <div>
              <h3 className="kds-col-title">Ready</h3>
              {ready.length === 0 ? (
                <p className="empty-state">Nothing waiting.</p>
              ) : (
                ready.map((o) => (
                  <Ticket
                    key={o._id}
                    order={o}
                    kind="ready"
                    busy={busyId === o._id}
                    onAdvance={() => handleAdvance(o, 'completed')}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default KitchenQueuePage;
