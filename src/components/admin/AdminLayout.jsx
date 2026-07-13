import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, Users, UserCog, Tags, ClipboardList, Dumbbell, Salad, 
  CalendarCheck, ScanLine, CreditCard, Banknote, LineChart, MessageSquare, 
  Bell, FileUp, Settings, User, Search, Menu, X, ChevronDown, LogOut, ChevronRight
} from 'lucide-react';
import CommandPalette from './CommandPalette';
import './AdminLayout.css';

const SIDEBAR_GROUPS = [
  {
    title: 'Dashboard',
    items: [
      { path: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Management',
    items: [
      { path: '/admin/members', label: 'Members', icon: Users },
      { path: '/admin/trainers', label: 'Trainers', icon: UserCog },
      { path: '/admin/plans', label: 'Plans', icon: Tags },
      { path: '/admin/programs', label: 'Programs', icon: ClipboardList },
      { path: '/admin/workouts', label: 'Workouts', icon: Dumbbell },
      { path: '/admin/diet-plans', label: 'Diet Plans', icon: Salad },
    ]
  },
  {
    title: 'Operations',
    items: [
      { path: '/admin/attendance', label: 'Attendance', icon: CalendarCheck },
      { path: '/admin/qr-attendance', label: 'QR Scanner', icon: ScanLine },
      { path: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
      { path: '/admin/payments', label: 'Payments', icon: Banknote },
      { path: '/admin/revenue', label: 'Revenue', icon: LineChart },
      { path: '/admin/leads', label: 'Contacts', icon: MessageSquare },
    ]
  },
  {
    title: 'System',
    items: [
      { path: '/admin/notifications', label: 'Notifications', icon: Bell },
      { path: '/admin/uploads', label: 'Uploads', icon: FileUp },
      { path: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  }
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Ctrl+K Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AD';
  };

  // Generate breadcrumbs from path
  const pathParts = location.pathname.split('/').filter(p => p && p !== 'admin');
  let currentTitle = 'Dashboard';
  if (pathParts.length > 0) {
    currentTitle = pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1).replace('-', ' ');
  }

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar */}
      <motion.aside 
        className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        initial={false}
      >
        <div className="admin-sidebar-header">
          <Link to="/admin/dashboard" className="admin-logo">
            {isCollapsed ? <span>I</span> : <>Iron<span>Fit</span></>}
          </Link>
          <button 
            className="sidebar-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{ display: window.innerWidth <= 1024 ? 'none' : 'flex' }}
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="admin-nav">
          {SIDEBAR_GROUPS.map((group, gIndex) => (
            <div key={gIndex}>
              {!isCollapsed && <div className="nav-section-title">{group.title}</div>}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={`nav-item ${isActive ? 'active' : ''}`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="nav-item-label">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </motion.aside>

      {/* Main Wrapper */}
      <div className="admin-main-wrapper">
        {/* Top Header */}
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              className="sidebar-toggle-btn" 
              style={{ display: window.innerWidth > 1024 ? 'none' : 'flex', padding: 0 }}
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* Breadcrumb */}
            <div style={{ display: window.innerWidth <= 768 ? 'none' : 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-tertiary)', fontSize: '14px', fontWeight: 500 }}>
              <span>Admin</span>
              <ChevronRight size={14} />
              <span style={{ color: 'var(--text-primary)' }}>{currentTitle}</span>
            </div>
          </div>

          <div className="header-actions">
            <div 
              className="header-search" 
              onClick={() => setIsCommandPaletteOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <Search size={16} color="var(--text-tertiary)" />
              <span style={{ color: 'var(--text-tertiary)', fontSize: '13px', flex: 1 }}>Search...</span>
              <kbd style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-medium)', fontSize: '11px', color: 'var(--text-tertiary)' }}>Ctrl K</kbd>
            </div>

            <Link to="/admin/notifications" className="icon-btn" title="Notifications">
              <Bell size={18} />
            </Link>
            
            <div style={{ position: 'relative' }}>
              <div 
                className="profile-dropdown" 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="profile-avatar">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    getInitials(user?.fullName)
                  )}
                </div>
                <div className="profile-info" style={{ display: window.innerWidth <= 768 ? 'none' : 'flex' }}>
                  <span className="profile-name">{user?.fullName || 'Admin User'}</span>
                  <span className="profile-role">{user?.role || 'Administrator'}</span>
                </div>
                <ChevronDown size={14} color="var(--text-secondary)" style={{ display: window.innerWidth <= 768 ? 'none' : 'block' }} />
              </div>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute', top: '110%', right: 0, width: '220px',
                      background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                      borderRadius: '12px', padding: '8px', boxShadow: 'var(--shadow-lg)',
                      zIndex: 50
                    }}
                  >
                    <div style={{ padding: '8px 12px', marginBottom: '4px', borderBottom: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{user?.email || 'admin@ironfit.com'}</div>
                    </div>
                    <Link to="/admin/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '6px', fontSize: '13px' }} className="nav-item">
                      <User size={16} /> My Profile
                    </Link>
                    <Link to="/admin/settings" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: 'var(--text-secondary)', textDecoration: 'none', borderRadius: '6px', fontSize: '13px' }} className="nav-item">
                      <Settings size={16} /> Workspace Settings
                    </Link>
                    <div style={{ height: '1px', background: 'var(--border-light)', margin: '8px 0' }}></div>
                    <button 
                      onClick={handleLogout}
                      style={{ width: '100%', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', color: 'var(--danger)', cursor: 'pointer', borderRadius: '6px', textAlign: 'left', fontSize: '13px', fontWeight: 500 }}
                      className="nav-item"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Main Content with Page Transitions */}
        <main className="admin-content" id="admin-main-scroll">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CommandPalette 
        isOpen={isCommandPaletteOpen} 
        onClose={() => setIsCommandPaletteOpen(false)} 
      />
    </div>
  );
};

export default AdminLayout;
