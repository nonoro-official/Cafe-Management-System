import { CAFE_NAME } from '../../utilities/constants.js';

const KioskBrand = () => {
  return (
    <header className="kiosk-brand">
      <div className="kiosk-brand__logo" aria-hidden="true">
        Logo
      </div>
      <p className="kiosk-brand__name">{CAFE_NAME}</p>
    </header>
  );
};

export default KioskBrand;
