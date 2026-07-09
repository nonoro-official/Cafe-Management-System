import { createBrowserRouter } from 'react-router-dom';
import KioskLayout from '../layouts/KioskLayout.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import KioskHome from '../pages/Kiosk-Home.jsx';
import KioskStart from '../pages/Kiosk-Start.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
  {
    path: '/kiosk',
    element: <KioskLayout />,
    children: [
      {
        index: true,
        element: <KioskStart />,
      },
      {
        path: 'start',
        element: <KioskStart />,
      },
      {
        path: 'home',
        element: <KioskHome />,
      },
    ],
  },
]);

export default router;
