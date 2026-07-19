import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/admin/PageHeader.jsx';
import Toolbar from '../components/admin/Toolbar.jsx';
import KpiCard from '../components/admin/KpiCard.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';
import { formatCurrency } from '../utilities/currency.js';
import { listOrders } from '../services/orderService.js';

const STATUS_TONE = { completed: 'good', cancelled: 'danger' };
const STATUS_LABEL = { completed: 'Completed', cancelled: 'Cancelled' };
const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const OrderHistoryPage = () => {
  useDocumentTitle(`${APP_NAME} | Order History`);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listOrders({ limit: 100, sort: 'createdAt', order: 'desc' })
      .then((res) =>
        setOrders(res.data.filter((o) => ['completed', 'cancelled'].includes(o.status))),
      )
      .catch((err) => setError(err?.response?.data?.message || 'Could not load order history.'))
      .finally(() => setLoading(false));
  }, []);

  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  }, [orders]);
  const completedToday = todayOrders.filter((o) => o.status === 'completed');
  const revenueToday = completedToday.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = completedToday.length ? revenueToday / completedToday.length : 0;

  const visible = orders.filter((o) => {
    const matchesStatus = status === 'all' || o.status === status;
    const matchesSearch =
      !search.trim() ||
      o.orderNumber.toLowerCase().includes(search.trim().toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.trim().toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <PageHeader
        eyebrow="Management"
        title="Order History"
        subtitle="Full record of past orders across Register and Kiosk"
      />
      <div className="admin-content">
        <div className="kpi-grid">
          <KpiCard label="Orders Today" value={todayOrders.length} />
          <KpiCard label="Revenue Today" value={formatCurrency(revenueToday)} />
          <KpiCard label="Avg. Order Value" value={formatCurrency(avgOrderValue)} />
        </div>

        <Toolbar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search order # or customer..."
          sortValue={status}
          onSortChange={setStatus}
          sortOptions={STATUS_OPTIONS}
        />

        {loading ? (
          <LoadingSpinner label="Loading order history..." />
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : visible.length === 0 ? (
          <p className="empty-state">No past orders match your search.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date &amp; Time</th>
                  <th>Type</th>
                  <th>Cashier</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((order) => (
                  <tr key={order._id}>
                    <td className="mono">#{order.orderNumber}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleString('en-PH', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>
                      {order.orderType === 'dine-in'
                        ? `Table ${order.tableNumber || '—'}`
                        : order.customerName || 'Take-Away'}
                    </td>
                    <td>—</td>
                    <td style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</td>
                    <td className="mono">{formatCurrency(order.total)}</td>
                    <td>
                      <StatusBadge tone={STATUS_TONE[order.status] || 'warn'}>
                        {STATUS_LABEL[order.status] || order.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-small"
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderHistoryPage;
