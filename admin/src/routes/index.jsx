import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import RequireAuth from '../components/auth/RequireAuth.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import MenuPage from '../pages/MenuPage.jsx';
import InventoryPage from '../pages/InventoryPage.jsx';
import StaffPage from '../pages/StaffPage.jsx';
import OrderHistoryPage from '../pages/OrderHistoryPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import OrdersPage from '../pages/OrdersPage.jsx';
import OrderDetailsPage from '../pages/OrderDetailsPage.jsx';
import KitchenQueuePage from '../pages/KitchenQueuePage.jsx';
import TransactionsPage from '../pages/TransactionsPage.jsx';
import CustomersPage from '../pages/CustomersPage.jsx';

// Payment is now an embedded modal inside OrderDetailsPage
// NOT routed here because they don't exist in your pages/ folder yet
// (per your last file listing): CustomersPage, ReportsPage, SettingsPage.
// Add them back in once those files actually exist

// Keep the router basename in sync with the Vite `base` (/admin/ in the
// reverse-proxy deployment, / in isolation) so links resolve correctly
// whether the app is mounted at the root or under /admin/.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

const router = createBrowserRouter(
  [
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
            { path: 'order-history', element: <OrderHistoryPage /> },
            { path: 'register', element: <RegisterPage /> },
            { path: 'orders', element: <OrdersPage /> },
            { path: 'orders/:id', element: <OrderDetailsPage /> },
            { path: 'kitchen-queue', element: <KitchenQueuePage /> },
            { path: 'transactions', element: <TransactionsPage /> },
            { path: 'customers', element: <CustomersPage /> },
          ],
        },
      ],
    },
  ],
  { basename },
);

export default router;
