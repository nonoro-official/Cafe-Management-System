import { Outlet } from 'react-router-dom';
import { KioskOrderProvider } from '../contexts/KioskOrderContext.jsx';
import { MenuProvider } from '../contexts/MenuContext.jsx';

const KioskLayout = () => {
  return (
    <MenuProvider>
      <KioskOrderProvider>
        <div className="kiosk-shell">
          <Outlet />
        </div>
      </KioskOrderProvider>
    </MenuProvider>
  );
};

export default KioskLayout;
