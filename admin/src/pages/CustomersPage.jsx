import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/admin/PageHeader.jsx';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';
import { formatCurrency } from '../utilities/currency.js';
import { listOrders } from '../services/orderService.js';

const tierFor = (orderCount) => {
  if (orderCount >= 15) return { label: 'Gold', tone: 'good' };
  if (orderCount >= 5) return { label: 'Silver', tone: 'warn' };
  return null;
};

// TODO(backend): no dedicated Customer entity
const CustomersPage = () => {
  useDocumentTitle(`${APP_NAME} | Customers`);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listOrders({ limit: 100, sort: 'createdAt', order: 'desc' })
      .then((res) => setOrders(res.data.filter((o) => o.status === 'completed' && o.customerName)))
      .catch((err) => setError(err?.response?.data?.message || 'Could not load customers.'))
      .finally(() => setLoading(false));
  }, []);

  const customers = useMemo(() => {
    const byName = {};
    orders.forEach((o) => {
      const key = o.customerName.trim();
      if (!byName[key])
        byName[key] = { name: key, orders: 0, totalSpent: 0, lastVisit: o.createdAt };
      byName[key].orders += 1;
      byName[key].totalSpent += o.total;
      if (new Date(o.createdAt) > new Date(byName[key].lastVisit))
        byName[key].lastVisit = o.createdAt;
    });
    return Object.values(byName).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [orders]);

  return (
    <>
      <PageHeader
        eyebrow="Front of House"
        title="Customers"
        subtitle={`${customers.length} recorded customers`}
      />
      <div className="admin-content">
        {loading ? (
          <LoadingSpinner label="Loading customers..." />
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : customers.length === 0 ? (
          <p className="empty-state">No completed orders with a customer name yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Visit</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const tier = tierFor(c.orders);
                  return (
                    <tr key={c.name}>
                      <td>
                        <b>{c.name}</b>
                      </td>
                      <td>{c.orders}</td>
                      <td className="mono">{formatCurrency(c.totalSpent)}</td>
                      <td>
                        {new Date(c.lastVisit).toLocaleDateString('en-PH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td>
                        {tier ? <StatusBadge tone={tier.tone}>{tier.label}</StatusBadge> : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default CustomersPage;
