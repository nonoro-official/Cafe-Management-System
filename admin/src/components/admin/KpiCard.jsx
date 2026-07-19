const KpiCard = ({ label, value, trend, trendTone = '' }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">{value}</div>
      {trend && <div className={`kpi-card__trend ${trendTone}`.trim()}>{trend}</div>}
    </div>
  );
};

export default KpiCard;
