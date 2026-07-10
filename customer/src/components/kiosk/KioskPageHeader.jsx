const KioskPageHeader = ({ eyebrow, title, subtitle, centered = true }) => {
  return (
    <header className={`kiosk-page-header${centered ? ' kiosk-page-header--centered' : ''}`}>
      {eyebrow && <p className="kiosk-page-header__eyebrow">{eyebrow}</p>}
      <h1 className="kiosk-page-header__title">{title}</h1>
      {subtitle && <p className="kiosk-page-header__subtitle">{subtitle}</p>}
      <div className="kiosk-page-header__divider" aria-hidden="true" />
    </header>
  );
};

export default KioskPageHeader;
