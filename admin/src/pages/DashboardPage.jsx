import { useEffect, useState } from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import PageHeader from '../components/admin/PageHeader.jsx';
import KpiCard from '../components/admin/KpiCard.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME, stockTone, stockLabel } from '../utilities/constants.js';
import { formatCurrency } from '../utilities/currency.js';
import StatusBadge from '../components/admin/StatusBadge.jsx';
import {
  getSalesReport,
  getDashboardOverview,
  getTopProducts,
  getSalesTrend,
} from '../services/reportService.js';
import { inventoryService } from '../services/inventoryService.js';

const dayRange = (offsetDays) => {
  const start = new Date();
  start.setDate(start.getDate() - offsetDays);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { from: start.toISOString(), to: end.toISOString() };
};

const trendFor = (todayValue, yesterdayValue) => {
  if (!yesterdayValue) return null;
  const delta = ((todayValue - yesterdayValue) / yesterdayValue) * 100;
  if (Math.abs(delta) < 1) return { label: '– flat vs. yesterday', tone: 'is-flat' };
  const rounded = Math.abs(Math.round(delta));
  return delta > 0
    ? { label: `▲ ${rounded}% vs. yesterday`, tone: '' }
    : { label: `▼ ${rounded}% vs. yesterday`, tone: 'is-down' };
};

const DashboardPage = () => {
  useDocumentTitle(`${APP_NAME} | Dashboard`);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today, setToday] = useState(null);
  const [yesterday, setYesterday] = useState(null);
  const [overview, setOverview] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [trend, setTrend] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [todaySales, yesterdaySales, overviewData, top, salesTrend, lowStock, invSummary] =
          await Promise.all([
            getSalesReport(dayRange(0)),
            getSalesReport(dayRange(1)),
            getDashboardOverview(),
            getTopProducts({ limit: 5 }),
            getSalesTrend({}),
            inventoryService.list({ lowStock: true, sort: 'stock:asc', limit: 5 }),
            inventoryService.summary(),
          ]);
        if (cancelled) return;
        setToday(todaySales);
        setYesterday(yesterdaySales);
        setOverview(overviewData);
        setTopProducts(top);
        setTrend(salesTrend.slice(-7));
        setLowStockItems(lowStock.data ?? []);
        setLowStockCount(invSummary.data?.lowStock ?? 0);
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
        <PageHeader eyebrow="Management" title="Dashboard" subtitle="Loading today's numbers..." />
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
  const revenueTrend = trendFor(today?.totals?.revenue ?? 0, yesterday?.totals?.revenue ?? 0);
  const ordersTrend = trendFor(today?.totals?.orders ?? 0, yesterday?.totals?.orders ?? 0);

  return (
    <>
      <PageHeader eyebrow="Management" title="Dashboard" subtitle="Overview" />
      <div className="admin-content dashboard-layout">
        <div className="dashboard-main">
          <div className="kpi-grid">
            <KpiCard
              label="Today's Revenue"
              value={formatCurrency(today?.totals?.revenue)}
              trend={revenueTrend?.label}
              trendTone={revenueTrend?.tone}
            />
            <KpiCard
              label="Today's Orders"
              value={today?.totals?.orders ?? 0}
              trend={ordersTrend?.label}
              trendTone={ordersTrend?.tone}
            />
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
                        style={{
                          height: `${Math.max(6, (point.revenue / maxTrendRevenue) * 100)}%`,
                        }}
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

          <div className="panel">
            <div className="panel__head">
              <h3>Low Stock Items</h3>
              {lowStockCount > 0 && (
                <StatusBadge tone="warn">{lowStockCount} need restocking</StatusBadge>
              )}
            </div>
            {lowStockItems.length === 0 ? (
              <p className="empty-state">All items are well stocked.</p>
            ) : (
              <div className="dashboard-sidebar__list">
                {lowStockItems.map((item) => (
                  <div className="rank-row" key={item.id || item.sku}>
                    <span className="rank-row__name">{item.name}</span>
                    <span className="rank-row__meta">{item.stock}%</span>
                    <StatusBadge tone={stockTone(item.stock)}>{stockLabel(item.stock)}</StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="dashboard-sidebar">
          <div className="register-cart-head">
            <h3 className="register-cart-head__title">Top Sellers Today</h3>
          </div>
          <div className="dashboard-sidebar__list">
            {topProducts.length === 0 ? (
              <p className="empty-state">No sales recorded yet.</p>
            ) : (
              topProducts.map((product, index) => (
                <div className="rank-row" key={product.productId || product.name}>
                  <span className="rank-row__num">{index + 1}</span>
                  {product.imageLoc ? (
                    <img className="rank-row__thumb" src={product.imageLoc} alt={product.name} />
                  ) : (
                    <div className="rank-row__thumb" />
                  )}
                  <span className="rank-row__name">{product.name}</span>
                  <span className="rank-row__meta">{product.quantitySold} sold</span>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </>
  );
};

export default DashboardPage;
