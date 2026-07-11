import { Outlet } from 'react-router-dom';
import Sidebar from '../components/admin/Sidebar.jsx';

const MainLayout = () => {
  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
