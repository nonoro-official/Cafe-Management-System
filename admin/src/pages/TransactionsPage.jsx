import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';
import { formatCurrency } from '../utilities/currency.js';
import { listOrders } from '../services/orderService.js';

const TransactionsPage = () => {
  useDocumentTitle(`${APP_NAME} | Transactions`);
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listOrders({ limit: 100, sort: 'createdAt', order: 'desc' })
      .then((res) =>
        setOrders(
          res.data.filter((o) => o.paymentStatus === 'paid' || o.paymentStatus === 'refunded'),
        ),
      )
      .catch((err) => setError(err?.response?.data?.message || 'Could not load transactions.'))
      .finally(() => setLoading(false));
  }, []);

  const totalsByMethod = useMemo(() => {
    const totals = { cash: 0, cashless: 0 };
    orders.forEach((o) => {
      if (o.paymentStatus === 'paid' && totals[o.paymentMethod] !== undefined) {
        totals[o.paymentMethod] += o.total;
      }
    });
    return totals;
  }, [orders]);

  return (
    <>
      <PageHeader
        eyebrow="Front of House"
        title="Transactions"
        subtitle="Payment ledger & reconciliation"
      />
      <div className="admin-content">
        <div className="kpi-row kpi-row-three">
          <div className="kpi-card">
            <div className="kpi-card__label">Cash</div>
            <div className="kpi-card__value">{formatCurrency(totalsByMethod.cash)}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-card__label">Cashless</div>
            <div className="kpi-card__value">{formatCurrency(totalsByMethod.cashless)}</div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading transactions..." />
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : orders.length === 0 ? (
          <p className="empty-state">No transactions recorded yet.</p>
        ) : (
          <div className="table-wrap" style={{ marginTop: '1.1rem' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Order #</th>
                  <th>Time</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Cashier</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="table-row-clickable"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <td className="mono">TXN-{order.orderNumber}</td>
                    <td className="mono">#{order.orderNumber}</td>
                    <td>
                      {new Date(order.createdAt).toLocaleString('en-PH', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</td>
                    <td className="mono">{formatCurrency(order.total)}</td>
                    <td>—</td>
                    <td>
                      <StatusBadge tone={order.paymentStatus === 'refunded' ? 'danger' : 'good'}>
                        {order.paymentStatus === 'refunded' ? 'Refunded' : 'Captured'}
                      </StatusBadge>
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

export default TransactionsPage;
