import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const DashboardPage = () => {
  useDocumentTitle(`${APP_NAME} | Dashboard`);

  return (
    <section className="page-card">
      <h2>Dashboard</h2>
      <p>
        The admin dashboard is ready. Modules for menu management, orders, staff, and analytics
        will be implemented in upcoming steps.
      </p>
      <LoadingSpinner label="Foundation ready" />
    </section>
  );
};

export default DashboardPage;
