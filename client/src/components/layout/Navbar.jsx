import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [showNotifs, setShowNotifs] = useState(false);

  const getPageTitle = () => {
    const map = {
      '/dashboard': 'Dashboard',
      '/create-exam': 'Create Exam',
      '/results': 'Results',
      '/exams': 'Exams',
      '/evaluation-progress': 'Evaluation',
      '/settings': 'Settings',
      '/pricing': 'Pricing',
      '/analytics': 'Analytics',
    };
    if (location.pathname.startsWith('/exams/')) return 'Exam Detail';
    return map[location.pathname] || 'AutoGrade Ai';
  };

  const handleExport = () => {
    addToast('Generating export file...', 'info');
    setTimeout(() => {
      const element = document.createElement("a");
      const file = new Blob(["This is a mock export file from AutoGrade Ai."], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "autograde-export.txt";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      addToast('Export downloaded successfully!', 'success');
    }, 1000);
  };

  return (
    <header className="fixed top-0 right-0 w-full lg:w-[calc(100%-16rem)] z-40 flex justify-between items-center px-3 sm:px-4 md:px-8 py-2.5 sm:py-3 bg-surface/80 backdrop-blur-xl font-headline text-sm transition-all duration-300">
      <div className="flex items-center gap-3 sm:gap-4 md:gap-8 min-w-0">
        <button
          className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors flex-shrink-0"
          onClick={onMenuClick}
        >
          <i className="ri-menu-line text-lg" />
        </button>
        <h2
          className="text-base sm:text-lg font-black text-on-surface truncate max-w-[120px] sm:max-w-[200px] md:max-w-none cursor-pointer hover:text-primary transition-colors"
          onClick={() => navigate('/dashboard')}
        >
          {getPageTitle()}
        </h2>
        <div className="hidden md:flex gap-1">
          {[
            { label: 'Overview', path: '/dashboard' },
            { label: 'Batch Status', path: '/evaluation-progress' },
          ].map((tab) => (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${location.pathname === tab.path ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 relative flex-shrink-0">
        <button
          onClick={() => navigate('/create-exam')}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-xs hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <i className="ri-add-line text-base" />
          <span>New Exam</span>
        </button>

        {/* Mobile-only quick add button */}
        <button
          onClick={() => navigate('/create-exam')}
          className="md:hidden p-2 bg-primary text-on-primary rounded-lg hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <i className="ri-add-line text-lg" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="text-on-surface-variant hover:text-primary relative p-2 rounded-lg hover:bg-surface-container-high transition-all cursor-pointer"
          >
            <i className="ri-notification-3-line text-xl" />
            <span className="sr-only">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
          </button>
          
          {showNotifs && (
            <>
              {/* Backdrop to close on mobile */}
              <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShowNotifs(false)} />
              <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-14 sm:top-auto sm:mt-2 w-auto sm:w-72 bg-white rounded-xl shadow-xl border border-outline-variant/10 overflow-hidden z-50 animate-slide-up">
                <div className="p-3 border-b border-outline-variant/10 bg-surface-container-lowest flex justify-between items-center">
                  <span className="font-bold text-xs uppercase tracking-widest text-outline">Notifications</span>
                  <span className="text-[10px] bg-error/10 text-error px-2 py-0.5 rounded-full font-bold">1 New</span>
                </div>
                <div className="p-3 hover:bg-surface-container-low cursor-pointer transition-colors" onClick={() => { setShowNotifs(false); navigate('/evaluation-progress'); }}>
                  <p className="text-xs font-bold text-on-surface">Evaluation Complete</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">CS-101 Midterm has finished grading. View results.</p>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={handleExport}
          className="hidden sm:flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-surface-container-high text-on-surface-variant rounded-lg font-bold text-xs hover:bg-surface-container-highest transition-all cursor-pointer"
        >
          <i className="ri-download-2-line text-base" />
          <span className="hidden md:inline">Export</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
