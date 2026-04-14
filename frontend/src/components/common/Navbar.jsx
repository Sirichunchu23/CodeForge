import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Code2, LayoutDashboard, User, Shield, Rss, Users, FileText, Menu, X } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
    setMobileOpen(false);
  };

  const isActive = (path) =>
    path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname === path || location.pathname.startsWith(path + '/');

  if (!user) {
    return (
      <nav style={styles.nav}>
        <div className="container" style={styles.inner}>
          <Link to="/" style={styles.logo}>
            <Code2 size={22} color="#6c63ff" />
            <span>CodeForge</span>
          </Link>
          <div style={styles.navLinks}>
            <Link to="/login" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        </div>
      </nav>
    );
  }

  const studentLinks = [
    { to: '/feed', icon: <Rss size={15} />, label: 'Feed' },
    { to: '/dashboard', icon: <LayoutDashboard size={15} />, label: 'Dashboard' },
    { to: `/profile/${user._id}`, icon: <User size={15} />, label: 'Profile' },
  ];

  const adminLinks = [
    { to: '/admin', icon: <Shield size={15} />, label: 'Dashboard' },
    { to: '/admin/users', icon: <Users size={15} />, label: 'Users' },
    { to: '/admin/posts', icon: <FileText size={15} />, label: 'Posts' },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        <Link to={user.role === 'admin' ? '/admin' : '/feed'} style={styles.logo}>
          <Code2 size={22} color="#6c63ff" />
          <span>CodeForge</span>
        </Link>

        {/* Desktop nav */}
        <div style={{ ...styles.navLinks, display: 'flex' }} className="desktop-nav">
          {links.map(({ to, icon, label }) => (
            <Link key={to} to={to} style={{ ...styles.navItem, ...(isActive(to) ? styles.navItemActive : {}) }}>
              {icon} {label}
            </Link>
          ))}
        </div>

        {/* Desktop user */}
        <div style={styles.userSection} className="desktop-nav">
          <div style={styles.userChip}>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
            <span style={styles.username}>{user.username}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary btn-sm">
            <LogOut size={14} /> Logout
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={styles.hamburger}
          className="mobile-only"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={styles.mobileMenu}>
          {links.map(({ to, icon, label }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)}
              style={{ ...styles.mobileLink, ...(isActive(to) ? styles.mobileLinkActive : {}) }}>
              {icon} {label}
            </Link>
          ))}
          <div style={styles.mobileDivider} />
          <div style={styles.mobileUser}>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user.username}</span>
          </div>
          <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ margin: '0.5rem 1rem' }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 641px) { .mobile-only { display: none !important; } }
        @media (max-width: 640px) { .desktop-nav { display: none !important; } }
      `}</style>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    background: 'rgba(10,10,15,0.97)', borderBottom: '1px solid #1e1e35',
    backdropFilter: 'blur(12px)',
  },
  inner: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    height: '4rem', gap: '1rem',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    fontWeight: 800, fontSize: '1.1rem', fontFamily: 'Syne, sans-serif', flexShrink: 0,
  },
  navLinks: { display: 'flex', alignItems: 'center', gap: '0.15rem' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '0.35rem',
    padding: '0.4rem 0.75rem', borderRadius: '6px',
    fontSize: '0.85rem', fontWeight: 600, color: '#8888aa',
    transition: 'all 0.15s',
  },
  navItemActive: { color: '#6c63ff', background: 'rgba(108,99,255,0.1)' },
  userSection: { display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 },
  userChip: { display: 'flex', alignItems: 'center', gap: '0.4rem' },
  username: { fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' },
  hamburger: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--text-primary)', padding: '0.25rem',
    display: 'flex', alignItems: 'center',
  },
  mobileMenu: {
    background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', padding: '0.75rem 0',
  },
  mobileLink: {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.75rem 1.25rem', fontSize: '0.9rem', fontWeight: 600,
    color: 'var(--text-secondary)', transition: 'all 0.15s',
  },
  mobileLinkActive: { color: 'var(--accent)', background: 'rgba(108,99,255,0.08)' },
  mobileDivider: { height: '1px', background: 'var(--border)', margin: '0.5rem 1rem' },
  mobileUser: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.25rem' },
};
