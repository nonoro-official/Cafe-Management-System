import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME, CAFE_NAME } from '../utilities/constants.js';

const KioskStart = () => {
  const navigate = useNavigate();

  useDocumentTitle(`${APP_NAME} | Kiosk`);

  const handleStart = () => {
    navigate('/kiosk/home');
  };

  return (
    <div className="kiosk-start">
      <header className="kiosk-start__brand">
        <div className="kiosk-start__logo" aria-hidden="true">
          Logo
        </div>
        <p className="kiosk-start__name">{CAFE_NAME}</p>
      </header>

      <div className="kiosk-start__banner" aria-hidden="true">
        Banner
      </div>

      <button
        type="button"
        className="kiosk-start__cta"
        onClick={handleStart}
        aria-label="Tap to start ordering"
      >
        Tap to Start Ordering
      </button>
    </div>
  );
};

export default KioskStart;
    