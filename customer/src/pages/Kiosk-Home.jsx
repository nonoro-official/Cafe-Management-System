import { useNavigate } from 'react-router-dom';
import KioskBrand from '../components/kiosk/KioskBrand.jsx';
import KioskPageHeader from '../components/kiosk/KioskPageHeader.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const ORDER_TYPES = [
  {
    id: 'dine-in',
    label: 'Dine-in',
    hint: 'Enjoy here in the cafe',
    icon: '🪑',
    className: 'kiosk-home__option--dine-in',
  },
  {
    id: 'take-out',
    label: 'Take-out',
    hint: 'Grab and go',
    icon: '🥡',
    className: 'kiosk-home__option--take-out',
  },
];

const KioskHome = () => {
  const navigate = useNavigate();

  useDocumentTitle(`${APP_NAME} | Order Type`);

  const handleSelectOrderType = (orderType) => {
    navigate('/kiosk/dashboard', { state: { orderType } });
  };

  return (
    <div className="kiosk-home kiosk-page">
      <KioskBrand compact />

      <div className="kiosk-home__content">
        <KioskPageHeader
          eyebrow="Step 1"
          title="How would you like your order?"
          subtitle="Choose where you'll enjoy your coffee"
        />

        <div className="kiosk-home__options" role="group" aria-label="Select order type">
          {ORDER_TYPES.map(({ id, label, hint, icon, className }) => (
            <button
              key={id}
              type="button"
              className={`kiosk-home__option ${className}`}
              onClick={() => handleSelectOrderType(id)}
            >
              <span className="kiosk-home__option-icon" aria-hidden="true">
                {icon}
              </span>
              <span className="kiosk-home__option-label">{label}</span>
              <span className="kiosk-home__option-hint">{hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KioskHome;
