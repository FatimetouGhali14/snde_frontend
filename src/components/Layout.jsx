import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Administrateur',
  directeur: 'Directeur',
  chef_brigade: 'Chef de Brigade',
  employe: 'Employé'
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    ...(user?.role === 'directeur' || user?.role === 'admin' || user?.role === 'chef_brigade'
      ? [{ path: '/dashboard', icon: '📊', label: 'Tableau de bord' }]
      : []),
    { path: '/incidents', icon: '⚡', label: 'Incidents' },
    { path: '/signaler', icon: '➕', label: 'Signaler' },
    ...(user?.role !== 'employe'
      ? [{ path: '/forages', icon: '📍', label: 'Sites' }]
      : []),
    ...(user?.role === 'admin'
      ? [{ path: '/utilisateurs', icon: '👥', label: 'Utilisateurs' }]
      : []),
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.jpg" alt="SNDE Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'inline'; }} />
          <span style={{ fontSize: 28, display: 'none' }}>💧</span>
          <div>
            <h1>SNDE</h1>
            <span style={{ fontSize: 11, fontWeight: 500 }}>Direction de la Production</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}>
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-name">{user?.nom}</div>
          <div className="user-role">{ROLE_LABELS[user?.role]}</div>
          {user?.brigade && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              {user.brigade}
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Se déconnecter
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
