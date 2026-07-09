import { useNavigate } from 'react-router-dom';
import KioskBrand from '../components/kiosk/KioskBrand.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const ORDER_TYPES = [
  { id: 'dine-in', label: 'Dine-in', className: 'kiosk-home__option--dine-in' },
  { id: 'take-out', label: 'Take-out', className: 'kiosk-home__option--take-out' },
];

const KioskHome = () => {
  const navigate = useNavigate();

  useDocumentTitle(`${APP_NAME} | Order Type`);

  const handleSelectOrderType = (orderType) => {
    navigate('/kiosk/dashboard', { state: { orderType } });
  };

  return (
    <div className="kiosk-home">
      <KioskBrand />

      <div className="kiosk-home__content">
        <div className="kiosk-home__options" role="group" aria-label="Select order type">
          {ORDER_TYPES.map(({ id, label, className }) => (
            <button
              key={id}
              type="button"
              className={`kiosk-home__option ${className}`}
              onClick={() => handleSelectOrderType(id)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="kiosk-home__arc" aria-hidden="true" />
    </div>
  );
};

export default KioskHome;
