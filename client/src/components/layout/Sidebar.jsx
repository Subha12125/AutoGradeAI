import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';

const Sidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'ri-dashboard-line' },
    { name: 'Quiz Arena', path: '/teacher/quizzes', icon: 'ri-gamepad-line' },
    { name: 'Exams', path: '/exams', icon: 'ri-file-text-line' },
    { name: 'Results', path: '/results', icon: 'ri-bar-chart-box-line' },
    { name: 'Analytics', path: '/analytics', icon: 'ri-line-chart-line' },
    { name: 'Pricing', path: '/pricing', icon: 'ri-bank-card-line' },
    { name: 'Settings', path: '/settings', icon: 'ri-settings-3-line' },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-full bg-surface-container-lowest z-50 transition-all duration-300 border-r border-outline-variant/10 ${
        isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
      } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
    >
      <div className={`flex flex-col h-full overflow-y-auto overflow-x-hidden ${isCollapsed ? 'p-3 items-center' : 'p-6'}`}>
        {/* Header with Logo and Collapse / Close buttons */}
        <div className={`flex items-center mb-6 w-full ${isCollapsed ? 'flex-col gap-3 justify-center' : 'justify-between px-2'}`}>
          <div
            onClick={() => navigate('/dashboard')}
            className={`flex items-center gap-3 cursor-pointer group select-none ${isCollapsed ? 'justify-center' : ''}`}
            title="AutoGrade AI Dashboard"
          >
            <img
              src={logo}
              alt="AutoGrade Ai Logo"
              className="w-9 h-9 object-contain rounded-xl drop-shadow-sm transition-transform duration-300 group-hover:scale-105 flex-shrink-0"
            />
            {!isCollapsed && (
              <span className="font-headline font-black text-lg tracking-tight text-on-surface truncate">
                AutoGrade <span className="text-primary font-black">AI</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Desktop Collapse / Expand Toggle Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <i className={`${isCollapsed ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'} text-lg`} />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error/5 transition-colors cursor-pointer"
              title="Close menu"
              aria-label="Close menu"
            >
              <i className="ri-close-line text-xl" />
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-1 w-full">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl font-semibold text-sm transition-all group relative ${
                  isCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <i className={`${item.icon} text-xl flex-shrink-0`} />
              {!isCollapsed ? (
                <span className="truncate">{item.name}</span>
              ) : (
                /* Flyout Tooltip when collapsed */
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-surface-container-highest text-on-surface text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-3 pt-4 border-t border-outline-variant/10 w-full">
          {!isCollapsed ? (
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
          ) : (
            <NavLink
              to="/pricing"
              onClick={onClose}
              className="flex justify-center p-3 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all group relative"
              title="Upgrade to Pro"
            >
              <i className="ri-shield-check-line text-xl" />
              <span className="absolute left-full ml-3 px-2.5 py-1 bg-surface-container-highest text-on-surface text-xs font-bold rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                Go Pro (₹2,500/mo)
              </span>
            </NavLink>
          )}

          <div className={`flex items-center py-2 ${isCollapsed ? 'flex-col gap-2 justify-center' : 'gap-3 px-2'}`}>
            <div
              className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs font-headline flex-shrink-0"
              title={user?.name || 'Professor'}
            >
              {user?.name?.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() || 'P'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">{user?.name || 'Professor'}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{user?.role || 'Faculty Member'}</p>
              </div>
            )}
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
