import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10" y="2" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
        <rect x="2" y="10" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10" y="10" width="6" height="6" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    to: '/menu',
    label: 'Menu',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <path d="M4 2v14M4 2c0 2.5 3 2.5 3 5s-3 2.5-3 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M9 2v6M9 4.5h4M9 8c0 3-2 3.5-2 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <path d="M2 5.5 9 2l7 3.5-7 3.5-7-3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M2 5.5V13l7 3.5 7-3.5V5.5M9 9v7.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/staff',
    label: 'Staff',
    icon: (
      <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
        <circle cx="6.5" cy="5.5" r="2.3" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="13" cy="6.5" r="1.9" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2 15c0-2.8 2-4.5 4.5-4.5S11 12.2 11 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M12 10.7c1.8.2 4 1.5 4 4.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const LogoutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 18 18" fill="none">
    <path
      d="M7 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h3"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 12l3.5-3.5L11 5M14.3 8.5H6.5"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand__mark">
          <span>M</span>
        </div>
        <div>
          <div className="admin-brand__name">MODA</div>
          <div className="admin-brand__role">Manager</div>
        </div>
      </div>

      <div className="admin-nav__section-label">Management</div>

      <nav className="admin-nav">
        {NAV_ITEMS.map(({ to, label, end, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `admin-nav__item${isActive ? ' is-active' : ''}`}
          >
            {icon}
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__foot">
        <button type="button" className="admin-nav__item admin-nav__item--logout" onClick={handleLogout}>
          <LogoutIcon />
          <span>Log out</span>
        </button>
        <div className="admin-sidebar__signed-in">Signed in as {user?.name || 'Manager'}</div>
      </div>
    </aside>
  );
};

export default Sidebar;
