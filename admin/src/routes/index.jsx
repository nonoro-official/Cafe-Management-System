import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
    ],
  },
]);

export default router;
