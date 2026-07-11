import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import PageHeader from '../components/admin/PageHeader.jsx';
import KpiCard from '../components/admin/KpiCard.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';
import {
  getSalesReport,
  getDashboardOverview,
  getTopProducts,
  getSalesTrend,
} from '../services/reportService.js';

const peso = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return { from: start.toISOString(), to: new Date().toISOString() };
};

const DashboardPage = () => {
  useDocumentTitle(`${APP_NAME} | Dashboard`);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today, setToday] = useState(null);
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [todaySales, overviewData, top, salesTrend] = await Promise.all([
          getSalesReport(todayRange()),
          getDashboardOverview(),
          getTopProducts({ limit: 5 }),
          getSalesTrend({}),
        ]);
        if (cancelled) return;
        setToday(todaySales);
        setOverview(overviewData);
        setTopProducts(top);
        setTrend(salesTrend.slice(-7));
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Could not load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader eyebrow="Manager" title="Dashboard" subtitle="Loading today's numbers..." />
        <div className="admin-content">
          <LoadingSpinner label="Fetching dashboard data" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader eyebrow="Manager" title="Dashboard" />
        <div className="admin-content">
          <div className="form-error">{error}</div>
        </div>
      </>
    );
  }

  const maxTrendRevenue = Math.max(1, ...trend.map((t) => t.revenue));
  const maxTrendOrders = Math.max(1, ...trend.map((t) => t.orders));

  return (
    <>
      <PageHeader eyebrow="Manager" title="Dashboard" subtitle="Kiosk Overview" />
      <div className="admin-content">
        <div className="kpi-grid">
          <KpiCard label="Today's Revenue" value={peso(today?.totals?.revenue)} />
          <KpiCard label="Today's Orders" value={today?.totals?.orders ?? 0} />
          <KpiCard label="Total Products" value={overview?.products ?? 0} />
          <KpiCard label="Total Customers" value={overview?.customers ?? 0} />
        </div>

        <div className="charts-row">
          <div className="panel">
            <div className="panel__head">
              <h3>Revenue Trend (Last 7 Days)</h3>
            </div>
            {trend.length === 0 ? (
              <p className="empty-state">
                No orders yet — the trend will fill in once orders come through.
              </p>
            ) : (
              <div className="bars">
                {trend.map((point) => (
                  <div className="bars__col" key={point.date}>
                    <div
                      className={`bars__bar${point.revenue === maxTrendRevenue ? ' is-peak' : ''}`}
                      style={{ height: `${Math.max(6, (point.revenue / maxTrendRevenue) * 100)}%` }}
                    />
                    <span className="bars__label">{point.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel__head">
              <h3>Orders Trend (Last 7 Days)</h3>
            </div>
            {trend.length === 0 ? (
              <p className="empty-state">
                No orders yet — the trend will fill in once orders come through.
              </p>
            ) : (
              <div className="bars">
                {trend.map((point) => (
                  <div className="bars__col" key={point.date}>
                    <div
                      className={`bars__bar${point.orders === maxTrendOrders ? ' is-peak' : ''}`}
                      style={{ height: `${Math.max(6, (point.orders / maxTrendOrders) * 100)}%` }}
                    />
                    <span className="bars__label">{point.date.slice(5)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lists-row">
          <div className="panel">
            <div className="panel__head">
              <h3>Low Stock Items</h3>
            </div>
            <p className="empty-state">Backend stuf</p>
          </div>

          <div className="panel">
            <div className="panel__head">
              <h3>Top Sellers Today</h3>
            </div>
            {topProducts.length === 0 ? (
              <p className="empty-state">No sales recorded yet.</p>
            ) : (
              topProducts.map((product, index) => (
                <div className="rank-row" key={product.productId || product.name}>
                  <span className="rank-row__num">{index + 1}</span>
                  <span className="rank-row__name">{product.name}</span>
                  <span className="rank-row__meta">{product.quantitySold} sold</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
