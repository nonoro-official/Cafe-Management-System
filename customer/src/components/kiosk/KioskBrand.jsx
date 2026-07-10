import { kioskStartAssets } from '../../data/kioskAssets.js';
import { CAFE_NAME } from '../../utilities/constants.js';

const KioskBrand = ({ compact = false }) => {
  return (
    <header className={`kiosk-brand${compact ? ' kiosk-brand--compact' : ''}`}>
      <div className="kiosk-brand__logo-wrap">
        <img className="kiosk-brand__logo" src={kioskStartAssets.logo} alt="" />
      </div>
      <p className="kiosk-brand__name">{CAFE_NAME}</p>
    </header>
  );
};

export default KioskBrand;
