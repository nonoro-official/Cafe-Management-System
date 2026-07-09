import { Outlet } from 'react-router-dom';

const KioskLayout = () => {
  return (
    <div className="kiosk-shell">
      <Outlet />
    </div>
  );
};

export default KioskLayout;
