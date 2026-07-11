const KpiCard = ({ label, value, trend }) => {
  return (
    <div className="kpi-card">
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">{value}</div>
      {trend && <div className="kpi-card__trend">{trend}</div>}
    </div>
  );
};

export default KpiCard;
