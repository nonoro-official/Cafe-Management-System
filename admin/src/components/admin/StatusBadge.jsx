const TONES = {
  good: 'badge--good',
  warn: 'badge--warn',
  danger: 'badge--danger',
};

const StatusBadge = ({ tone = 'good', children }) => {
  return <span className={`badge ${TONES[tone] || TONES.good}`}>{children}</span>;
};

export default StatusBadge;
