import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import autoGradeLogo from '../../assets/AutoGrade Ai.png';

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'ri-dashboard-line' },
    { name: 'Exams', path: '/exams', icon: 'ri-file-text-line' },
    { name: 'Results', path: '/results', icon: 'ri-bar-chart-box-line' },
    { name: 'Analytics', path: '/analytics', icon: 'ri-line-chart-line' },
    { name: 'Pricing', path: '/pricing', icon: 'ri-bank-card-line' },
    { name: 'Settings', path: '/settings', icon: 'ri-settings-3-line' },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full w-64 bg-surface-container-lowest z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="p-6 flex flex-col h-full overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-6 px-2">
          <img src={autoGradeLogo} alt="AutoGrade Ai Logo" className="w-28 h-auto object-contain drop-shadow-lg" />
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${isActive ? 'bg-primary text-on-primary shadow-md shadow-primary/20' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
            >
              <i className={`${item.icon} text-xl`} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-3 pt-4 border-t border-outline-variant/10">
          <NavLink
            to="/pricing"
            onClick={onClose}
            className="block bg-gradient-to-br from-secondary/10 to-primary/5 rounded-2xl p-4 relative overflow-hidden group cursor-pointer hover:from-secondary/20 transition-all"
          >
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-1">Upgrade</p>
              <p className="text-sm font-bold text-on-surface">Go Pro — ₹2,500/mo</p>
            </div>
            <i className="ri-shield-check-line absolute -right-2 -bottom-2 text-6xl text-secondary/10 group-hover:text-secondary/20 transition-colors pointer-events-none" />
          </NavLink>

          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs font-headline">
              {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'P'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{user?.name || 'Professor'}</p>
              <p className="text-[10px] text-on-surface-variant truncate">{user?.role || 'Faculty Member'}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-all cursor-pointer"
              title="Logout"
            >
              <i className="ri-logout-box-r-line text-lg" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
