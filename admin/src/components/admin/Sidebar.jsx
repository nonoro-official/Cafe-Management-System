import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const iconProps = { width: 17, height: 17, viewBox: '0 0 18 18', fill: 'none' };

const MANAGEMENT_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg {...iconProps}>
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
      <svg {...iconProps}>
        <path
          d="M4 2v14M4 2c0 2.5 3 2.5 3 5s-3 2.5-3 5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M9 2v6M9 4.5h4M9 8c0 3-2 3.5-2 6.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/inventory',
    label: 'Inventory',
    icon: (
      <svg {...iconProps}>
        <path
          d="M2 5.5 9 2l7 3.5-7 3.5-7-3.5Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path
          d="M2 5.5V13l7 3.5 7-3.5V5.5M9 9v7.5"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/staff',
    label: 'Staff',
    icon: (
      <svg {...iconProps}>
        <circle cx="6.5" cy="5.5" r="2.3" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="13" cy="6.5" r="1.9" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M2 15c0-2.8 2-4.5 4.5-4.5S11 12.2 11 15"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M12 10.7c1.8.2 4 1.5 4 4.3"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    to: '/order-history',
    label: 'Order History',
    icon: (
      <svg {...iconProps}>
        <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const FRONT_OF_HOUSE_ITEMS = [
  {
    to: '/register',
    label: 'Register',
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="4" width="14" height="10" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 8h8M5 11h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/orders',
    label: 'Orders',
    icon: (
      <svg {...iconProps}>
        <path
          d="M4 2h10v14l-2.5-1.5L9 16l-2.5-1.5L4 16V2Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    to: '/transactions',
    label: 'Transactions',
    icon: (
      <svg {...iconProps}>
        <path
          d="M3 6h8M9 4l2 2-2 2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 12H7M9 10l-2 2 2 2"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

const BACK_OF_HOUSE_ITEMS = [
  {
    to: '/kitchen-queue',
    label: 'Kitchen Display',
    icon: (
      <svg {...iconProps}>
        <rect x="2" y="3" width="14" height="9" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
        <path d="M6 15.5h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
];

const LogoutIcon = () => (
  <svg {...iconProps}>
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

const NavGroup = ({ label, items }) => (
  <div>
    <div className="admin-nav__section-label">{label}</div>
    <nav className="admin-nav">
      {items.map(({ to, label: itemLabel, end, icon }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => `admin-nav__item${isActive ? ' is-active' : ''}`}
        >
          {icon}
          <span>{itemLabel}</span>
        </NavLink>
      ))}
    </nav>
  </div>
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
          <div className="admin-brand__name">MODA Cafe & Bakery</div>
          <div className="admin-brand__role">Admin</div>
        </div>
      </div>

      <div className="admin-nav-groups">
        <NavGroup label="Management" items={MANAGEMENT_ITEMS} />
        <NavGroup label="Front of House" items={FRONT_OF_HOUSE_ITEMS} />
        <NavGroup label="Back of House" items={BACK_OF_HOUSE_ITEMS} />
      </div>

      <div className="admin-sidebar__foot">
        <button
          type="button"
          className="admin-nav__item admin-nav__item--logout"
          onClick={handleLogout}
        >
          <LogoutIcon />
          <span>Log out</span>
        </button>
        <div className="admin-sidebar__signed-in">Signed in as {user?.name || 'Manager'}</div>
      </div>
    </aside>
  );
};

export default Sidebar;
