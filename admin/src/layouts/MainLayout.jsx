import { Outlet } from 'react-router-dom';
import { APP_NAME } from '../utilities/constants.js';

const MainLayout = () => {
  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">Admin Dashboard</p>
        <h1>{APP_NAME}</h1>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
