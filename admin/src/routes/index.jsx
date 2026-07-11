import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import RequireAuth from '../components/auth/RequireAuth.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import MenuPage from '../pages/MenuPage.jsx';
import InventoryPage from '../pages/InventoryPage.jsx';
import StaffPage from '../pages/StaffPage.jsx';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RequireAuth />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'menu', element: <MenuPage /> },
          { path: 'inventory', element: <InventoryPage /> },
          { path: 'staff', element: <StaffPage /> },
        ],
      },
    ],
  },
]);

export default router;
