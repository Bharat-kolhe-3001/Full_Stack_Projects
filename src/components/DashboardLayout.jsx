import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './DashboardLayout.css';

export default function DashboardLayout({ children, navItems, title, subtitle, role, activeTab, onTabChange }) {
  const { currentUser, logout, darkMode, setDarkMode } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';

  const brandColors = {
    admin: { from: '#0a2e18', to: '#14532d' },
    farmer: { from: '#14532d', to: '#166534' },
    customer: { from: '#1e3a5f', to: '#1e40af' },
  };
  const colors = brandColors[role] || brandColors.admin;

  return (
    <div className={`dash-layout ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <aside className="dash-sidebar" style={{ background: `linear-gradient(180deg, ${colors.from}, ${colors.to})` }}>
        <div className="sidebar-brand">
          <span className="sidebar-logo">🐔</span>
          <span>PoultrySmart</span>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <button key={i}
              className={`nav-item ${activeTab === i ? 'active' : ''}`}
              onClick={() => { onTabChange?.(i); setSidebarOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <strong>{currentUser?.name || 'User'}</strong>
              <span>{currentUser?.email || ''}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="dash-main">
        <div className="dash-topbar">
          <div className="topbar-left">
            <button className="hamburger-dash" onClick={() => setSidebarOpen(o => !o)}>☰</button>
            <div>
              <h2>{title}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn" onClick={() => setDarkMode(d => !d)} title="Toggle dark mode">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
        <div className="dash-content">{children}</div>
      </main>
    </div>
  );
}
