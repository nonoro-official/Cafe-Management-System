import { createBrowserRouter } from 'react-router-dom';
import KioskLayout from '../layouts/KioskLayout.jsx';
import MainLayout from '../layouts/MainLayout.jsx';
import HomePage from '../pages/HomePage.jsx';
import KioskCashlessPayment from '../pages/Kiosk-Cashless-Payment.jsx';
import KioskCart from '../pages/Kiosk-Cart.jsx';
import KioskCheckout from '../pages/Kiosk-Checkout.jsx';
import KioskDashboard from '../pages/Kiosk-Dashboard.jsx';
import KioskHome from '../pages/Kiosk-Home.jsx';
import KioskStart from '../pages/Kiosk-Start.jsx';
import KioskTicketNumber from '../pages/Kiosk-Ticket-Number.jsx';

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
      {
        path: 'dashboard',
        element: <KioskDashboard />,
      },
      {
        path: 'cart',
        element: <KioskCart />,
      },
      {
        path: 'checkout',
        element: <KioskCheckout />,
      },
      {
        path: 'cashless-payment',
        element: <KioskCashlessPayment />,
      },
      {
        path: 'ticket-number',
        element: <KioskTicketNumber />,
      },
    ],
  },
]);

export default router;
