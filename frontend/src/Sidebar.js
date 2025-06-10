import React from 'react';
import './Sidebar.css';

const menuItems = [
  { label: 'Главная', icon: '🏠', key: 'home' },
  { label: 'Профиль', icon: '😺', key: 'profile' },
  { label: 'Урок', icon: '📚', key: 'lesson' },
  { label: 'Достижения', icon: '🏆', key: 'achievements' },
];

export default function Sidebar({ active, onSelect, onLogin, user, onLogout }) {
  return (
    <nav className="sidebar">
      {user ? (
        <div className="sidebar-user-email">
          <span className="sidebar-icon">👤</span>
          <span>{user.email}</span>
        </div>
      ) : (
        <button className="sidebar-login-btn" onClick={onLogin}>
          <span className="sidebar-icon">👤</span>
          <span>Войти</span>
        </button>
      )}
      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li
            key={item.key}
            className={active === item.key ? 'active' : ''}
            onClick={() => { onSelect(item.key); }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
      {user && (
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <span className="sidebar-icon">🚪</span>
          <span>Выйти</span>
        </button>
      )}
    </nav>
  );
}