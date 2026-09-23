import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useToast } from '../../context/ToastContext';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { addToast } = useToast();

  const handleLinkClick = (e, name) => {
    e.preventDefault();
    addToast(`Opening ${name} page...`, 'info');
  };

  return (
    <div className="bg-background text-on-surface flex min-h-screen relative overflow-x-hidden">
      {/* Mobile overlay */}
      <div 
        className={`fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setSidebarOpen(false)}
      />
      
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="lg:ml-64 flex-1 min-h-screen relative transition-all duration-300">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
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
              <button onClick={(e) => handleLinkClick(e, 'Privacy Policy')} className="text-[10px] text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors">Privacy</button>
              <button onClick={(e) => handleLinkClick(e, 'Terms of Service')} className="text-[10px] text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors">Terms</button>
              <button onClick={(e) => handleLinkClick(e, 'Support')} className="text-[10px] text-outline hover:text-primary font-bold uppercase tracking-widest transition-colors">Support</button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Layout;
