const PageHeader = ({ eyebrow, title, subtitle }) => {
  return (
    <header className="admin-topbar">
      {eyebrow && <p className="admin-topbar__eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {subtitle && <p className="admin-topbar__subtitle">{subtitle}</p>}
    </header>
  );
};

export default PageHeader;
