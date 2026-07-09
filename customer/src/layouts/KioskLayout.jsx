import { Outlet } from 'react-router-dom';
import { KioskOrderProvider } from '../contexts/KioskOrderContext.jsx';

const KioskLayout = () => {
  return (
    <KioskOrderProvider>
      <div className="kiosk-shell">
        <Outlet />
      </div>
    </KioskOrderProvider>
  );
};

export default KioskLayout;
