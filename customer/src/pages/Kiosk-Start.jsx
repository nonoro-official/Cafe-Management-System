import { useNavigate } from 'react-router-dom';
import { kioskStartAssets } from '../data/kioskAssets.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { APP_NAME } from '../utilities/constants.js';

const KIOSK_FEATURES = ['Freshly brewed', 'Ready in minutes', 'Pay your way'];

const KioskStart = () => {
  const navigate = useNavigate();

  useDocumentTitle(`${APP_NAME} | Kiosk`);

  const handleStart = () => {
    navigate('/kiosk/home');
  };

  return (
    <div className="kiosk-start">
      <div className="kiosk-start__ambient" aria-hidden="true">
        <span className="kiosk-start__orb kiosk-start__orb--one" />
        <span className="kiosk-start__orb kiosk-start__orb--two" />
        <span className="kiosk-start__orb kiosk-start__orb--three" />
      </div>

      <section className="kiosk-start__hero">
        <div className="kiosk-start__hero-panel">
          <div className="kiosk-start__hero-content">
            <p className="kiosk-start__eyebrow">Order here</p>

            <h1 className="kiosk-start__headline">
              Start your day
              <br />
              <span className="kiosk-start__headline-accent">with a cup of coffee</span>
            </h1>

            <div className="kiosk-start__divider" />

            <p className="kiosk-start__tagline">Quick &amp; Easy self-service</p>

            <ul className="kiosk-start__features">
              {KIOSK_FEATURES.map((feature, index) => (
                <li
                  key={feature}
                  className="kiosk-start__feature"
                  style={{ animationDelay: `${0.35 + index * 0.1}s` }}
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <img
          className="kiosk-start__stain"
          src={kioskStartAssets.coffeeStain}
          alt=""
          aria-hidden="true"
        />
      </section>

      <button
        type="button"
        className="kiosk-start__footer"
        onClick={handleStart}
        aria-label="Tap to start ordering"
      >
        <span className="kiosk-start__footer-shine" aria-hidden="true" />

        <span className="kiosk-start__logo-wrap">
          <img
            className="kiosk-start__logo"
            src={kioskStartAssets.logo}
            alt="MODA Cafe and Bakery"
          />
        </span>

        <span className="kiosk-start__cta-group">
          <span className="kiosk-start__cta-text">Tap to Start Ordering</span>
          <span className="kiosk-start__cta-hint">Crafted fresh, just for you</span>
        </span>

        <span className="kiosk-start__tap-wrap">
          <img
            className="kiosk-start__tap-icon"
            src={kioskStartAssets.tapIcon}
            alt=""
            aria-hidden="true"
          />
        </span>
      </button>
    </div>
  );
};

export default KioskStart;
