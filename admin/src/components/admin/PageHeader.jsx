import { useState, useEffect } from 'react';

const formatDateTime = (date) =>
  date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const PageHeader = ({ eyebrow, title, subtitle, onBack, meta }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  const clock = <span className="admin-topbar__clock">{formatDateTime(now)}</span>;

  if (onBack) {
    return (
      <header className="admin-topbar admin-topbar--split">
        <button type="button" className="btn-link" onClick={onBack}>
          ← {title}
        </button>
        <div className="admin-topbar__right">
          {meta && <div className="admin-topbar__meta">{meta}</div>}
          {clock}
        </div>
      </header>
    );
  }

  return (
    <header className="admin-topbar">
      {eyebrow && <p className="admin-topbar__eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {subtitle && <p className="admin-topbar__subtitle">{subtitle}</p>}
      {clock}
    </header>
  );
};

export default PageHeader;
