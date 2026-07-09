const KioskNumberDisplay = ({ label, number }) => {
  return (
    <div className="kiosk-confirmation__number-box" aria-label={`${label} number ${number}`}>
      <span className="kiosk-confirmation__label">{label}</span>
      <span className="kiosk-confirmation__hash">#{number}</span>
    </div>
  );
};

export default KioskNumberDisplay;
