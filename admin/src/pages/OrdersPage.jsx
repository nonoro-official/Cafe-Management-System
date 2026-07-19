import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/admin/PageHeader.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';
import { formatCurrency } from '../utilities/currency.js';
import { listOrders, updateOrderStatus } from '../services/orderService.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready', label: 'Ready' },
  { value: 'served', label: 'Served' },
];

const STATUS_DISPLAY = { preparing: 'preparing', ready: 'ready', completed: 'served' };
const NEXT_STATUS = { preparing: 'ready', ready: 'completed' };

const OrdersPage = () => {
  useDocumentTitle(`${APP_NAME} | Orders`);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    listOrders({ limit: 100, sort: 'createdAt', order: 'desc' })
      .then((res) => setOrders(res.data.filter((o) => o.status !== 'cancelled')))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const start = () => {
      setLoading(true);
      setError('');
      load();
    };
    start();
    const interval = setInterval(load, 15000); // live queue
    return () => clearInterval(interval);
  }, []);

  const visible = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'served') return o.status === 'completed';
    return o.status === filter;
  });

  const handleStatusClick = async (e, order) => {
    e.stopPropagation();
    const next = NEXT_STATUS[order.status];
    if (!next) return; // already served (completed) — matches mockup's "if served, return"
    setBusyId(order._id);
    try {
      await updateOrderStatus(order._id, next);
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
        eyebrow="Front of House"
        title="Orders"
        subtitle="Live queue across the register"
      />
      <div className="admin-content">
        <div className="cat-tabs">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              className={`cat-tabs__item${filter === f.value ? ' is-active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading orders..." />
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : visible.length === 0 ? (
          <p className="empty-state">No orders in this state.</p>
        ) : (
          <div className="orders-grid">
            {visible.map((order) => {
              const count = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
              const typeLabel =
                order.orderType === 'dine-in'
                  ? `Table ${order.tableNumber || '—'}`
                  : `${order.customerName || 'Take-Away'}`;
              const displayStatus = STATUS_DISPLAY[order.status] || order.status;
              return (
                <div
                  className="order-card"
                  key={order._id}
                  onClick={() => navigate(`/orders/${order._id}`)}
                >
                  <div className="oc-top">
                    <span className="oc-num">#{order.orderNumber}</span>
                    <span className="cell-sub">{typeLabel}</span>
                  </div>
                  <div className="cell-sub">
                    {count} item{count === 1 ? '' : 's'} · {formatCurrency(order.total)} ·{' '}
                    {new Date(order.createdAt).toLocaleTimeString('en-PH', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  <button
                    type="button"
                    className={`oc-status oc-status--${order.status}`}
                    disabled={busyId === order._id || displayStatus === 'served'}
                    onClick={(e) => handleStatusClick(e, order)}
                  >
                    {displayStatus}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
