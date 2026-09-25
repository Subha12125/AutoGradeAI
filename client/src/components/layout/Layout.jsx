import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useToast } from '../../context/ToastContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [isWarmingUp, setIsWarmingUp] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  useEffect(() => {
    const handleColdStart = (e) => {
      setIsWarmingUp(!!e.detail?.active);
    };
    window.addEventListener('backend-cold-start', handleColdStart);
    return () => window.removeEventListener('backend-cold-start', handleColdStart);
  }, []);

  const handleLinkClick = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className="bg-background text-on-surface flex min-h-screen relative overflow-x-hidden">
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      />
      
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
      />
      
      <main className={`${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'} flex-1 min-h-screen relative transition-all duration-300`}>
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
        {isWarmingUp && (
          <div className={`fixed top-16 left-0 ${isCollapsed ? 'lg:left-20' : 'lg:left-64'} right-0 z-40 bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center justify-center gap-2 backdrop-blur-md animate-fade-in transition-all duration-300`}>
            <span className="material-symbols-outlined text-amber-500 text-sm animate-spin">sync</span>
            <span className="text-xs font-semibold text-amber-700">Connecting to server... Cloud instance is waking up, please allow a few seconds.</span>
          </div>
        )}
        <div className="pt-16 sm:pt-24 px-3 sm:px-4 md:px-8 pb-8 sm:pb-12 w-full overflow-x-hidden">
          <div key={location.pathname} className="animate-page-in">
            {children || <Outlet />}
          </div>
        </div>
        {/* Footer */}
        <footer className="lg:ml-0 border-t border-outline-variant/10 bg-surface-container-lowest/50 backdrop-blur-sm">
          <div className="px-4 sm:px-8 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-outline font-bold uppercase tracking-widest">© 2026 AutoGrade Ai • All rights reserved</p>
            <div className="flex gap-6">
              <button onClick={(e) => handleLinkClick(e, '/privacy')} className="text-[10px] text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors cursor-pointer">Privacy</button>
              <button onClick={(e) => handleLinkClick(e, '/terms')} className="text-[10px] text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors cursor-pointer">Terms</button>
              <button onClick={(e) => handleLinkClick(e, '/support')} className="text-[10px] text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors cursor-pointer">Support</button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
