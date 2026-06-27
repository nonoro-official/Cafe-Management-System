import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const HomePage = () => {
  useDocumentTitle(`${APP_NAME} | Home`);

  return (
    <section className="page-card">
      <h2>Welcome</h2>
      <p>
        The customer application is ready. Feature modules such as menu browsing, cart, and
        ordering will be implemented in upcoming steps.
      </p>
      <LoadingSpinner label="Foundation ready" />
    </section>
  );
};

export default HomePage;
