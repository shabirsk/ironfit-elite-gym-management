import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useMemberAuth } from '../contexts/MemberAuthContext';
import { getUnreadCount } from '../api/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import { getMemberDashboard } from '../api/memberPortal';
import ErrorBoundary from './ErrorBoundary';
import '../styles/member/MemberPortal.css';

const navItems = [
  {
    section: 'Main',
    items: [
      { path: '/member/dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    ],
  },
  {
    section: 'Fitness',
    items: [
      { path: '/member/attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { path: '/member/workouts', label: 'Workouts', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
      { path: '/member/diet-plans', label: 'Diet Plans', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
    ],
  },
  {
    section: 'Membership',
    items: [
      { path: '/member/plans', label: 'Plans & Pricing', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
      { path: '/member/payments', label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    ],
  },
  {
    section: 'Account',
    items: [
      { path: '/member/notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
      { path: '/member/profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ],
  },
];

const NavIcon = ({ path }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const MemberLayout = () => {
  const { user, member, logout } = useMemberAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const data = await getUnreadCount();
        setUnread(data.unread || 0);
      } catch {}
    };
    const fetchDashboard = async () => {
      try {
        const data = await getMemberDashboard();
        setDashboard(data);
      } catch {}
    };
    fetchUnread();
    fetchDashboard();
    const interval = setInterval(fetchUnread, 30000);
    window.addEventListener('notificationsUpdated', fetchUnread);
    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationsUpdated', fetchUnread);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/member/login');
  };

  const pageTitle = navItems
    .flatMap(s => s.items)
    .find(i => i.path === location.pathname)?.label || '';

  const attendancePct = dashboard?.attendance?.percentage || 0;
  const circumference = 2 * Math.PI * 20.5;
  const progressOffset = circumference - (attendancePct / 100) * circumference;

  return (
    <div className="mp-layout">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mp-mobile-toggle"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {sidebarOpen
            ? <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            : <><path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" /></>
          }
        </svg>
      </button>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="mp-sidebar-overlay open"
            onClick={() => setSidebarOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <nav className={`mp-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="mp-sidebar-header">
          <Link to="/" className="mp-sidebar-brand" onClick={() => setSidebarOpen(false)}>
            <div className="mp-sidebar-brand-icon">IF</div>
            <div>
              <div className="mp-sidebar-brand-text">Iron<span>Fit</span></div>
              <div className="mp-sidebar-brand-badge">ELITE</div>
            </div>
          </Link>
        </div>

        <div className="mp-sidebar-profile">
          <div className="mp-sidebar-avatar">
            {member?.profileImage ? (
              <img src={member.profileImage} alt={user?.fullName} style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover' }} />
            ) : (
              user?.fullName?.charAt(0)?.toUpperCase() || 'M'
            )}
          </div>
          <div className="mp-sidebar-profile-info">
            <div className="mp-sidebar-profile-name">{user?.fullName || 'Member'}</div>
            <div className="mp-sidebar-profile-plan">
              <span className={`mp-sidebar-profile-badge ${member?.status === 'active' ? 'active' : 'inactive'}`}>
                {member?.status || 'inactive'}
              </span>
            </div>
          </div>
        </div>

        {dashboard?.subscription && (
          <div className="mp-sidebar-progress">
            <div className="mp-sidebar-progress-ring">
              <svg viewBox="0 0 48 48">
                <circle className="bg" cx="24" cy="24" r="20.5" />
                <circle
                  className="fill"
                  cx="24" cy="24" r="20.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={progressOffset}
                />
              </svg>
            </div>
            <div className="mp-sidebar-progress-info">
              <h4>{dashboard.subscription.planName || 'Active Plan'}</h4>
              <p>{dashboard.subscription.daysRemaining || 0} days remaining</p>
            </div>
          </div>
        )}

        <div className="mp-nav">
          {navItems.map((section) => (
            <div key={section.section}>
              <div className="mp-nav-section-label">{section.section}</div>
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`mp-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="mp-nav-icon">
                      <NavIcon path={item.icon} />
                    </span>
                    <span>{item.label}</span>
                    {item.path === '/member/notifications' && unread > 0 && (
                      <span className="mp-nav-badge">{unread > 99 ? '99+' : unread}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mp-sidebar-footer">
          <button onClick={handleLogout} className="mp-sidebar-logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </nav>

      <div className="mp-main">
        <div className="mp-topbar">
          <div className="mp-topbar-left">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--mp-text-tertiary)', fontSize: '13px', fontWeight: 500, marginBottom: '2px' }}>
              <span>Home</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              <span style={{ color: 'var(--mp-primary)' }}>{pageTitle || 'Dashboard'}</span>
            </div>
            <h2 className="mp-topbar-title">{pageTitle || 'Dashboard'}</h2>
          </div>
          <div className="mp-topbar-right">
            <Link to="/member/notifications" className="mp-topbar-btn" title="Notifications">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unread > 0 && <span className="mp-topbar-notif-dot" />}
            </Link>
            <Link to="/member/profile" className="mp-topbar-btn" title="Profile">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          </div>
        </div>

        <div className="mp-content">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default MemberLayout;
