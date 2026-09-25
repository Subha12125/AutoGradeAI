import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const PublicNavbar = ({ onPricingClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigate(`/#${sectionId}`);
  };

  const handlePricingNav = () => {
    setMobileMenuOpen(false);
    if (onPricingClick) {
      onPricingClick();
      return;
    }
    if (location.pathname === '/') {
      const el = document.getElementById('pricing');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    navigate('/pricing');
  };

  return (
    <header className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 w-[94%] sm:w-[90%] max-w-5xl z-50 transition-all duration-300">
      {/* iOS 16 Liquid Glass Capsule Bar */}
      <nav
        className={`relative w-full rounded-full px-4 sm:px-6 py-2 sm:py-2.5 flex items-center justify-between transition-all duration-300 ${
          scrolled
            ? 'bg-white/75 backdrop-blur-2xl backdrop-saturate-200 border border-white/90 shadow-[0_16px_40px_-8px_rgba(20,30,80,0.15),inset_0_1px_1px_0_rgba(255,255,255,0.95)]'
            : 'bg-white/65 backdrop-blur-xl backdrop-saturate-150 border border-white/70 shadow-[0_10px_30px_-6px_rgba(20,30,80,0.08),inset_0_1px_1px_0_rgba(255,255,255,0.85)]'
        }`}
        style={{
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        }}
      >
        {/* Specular Liquid Light Sheen */}
        <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white to-transparent opacity-80 pointer-events-none rounded-full" />

        {/* Brand Logo & Name */}
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="relative">
            <img
              src={logo}
              alt="AutoGrade Ai Logo"
              className="h-8 sm:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm rounded-lg"
            />
            {/* Subtle glow behind logo */}
            <div className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-headline font-black text-base sm:text-lg tracking-tight text-slate-900">
            AutoGrade<span className="text-primary font-black ml-0.5">AI</span>
          </span>
        </div>

        {/* Center Desktop Navigation Pills */}
        <div className="hidden md:flex items-center gap-1 bg-black/[0.03] p-1 rounded-full border border-white/50">
          <button
            onClick={() => handleNavClick('features')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-primary hover:bg-white/80 active:scale-95 transition-all"
          >
            Features
          </button>
          <button
            onClick={() => handleNavClick('interactive-demo')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-primary hover:bg-white/80 active:scale-95 transition-all"
          >
            Live Demo
          </button>
          <button
            onClick={() => handleNavClick('workflow')}
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-slate-700 hover:text-primary hover:bg-white/80 active:scale-95 transition-all"
          >
            How It Works
          </button>
          <button
            onClick={handlePricingNav}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              location.pathname === '/pricing'
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'text-slate-700 hover:text-primary hover:bg-white/80 active:scale-95'
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              navigate('/support');
            }}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              location.pathname === '/support'
                ? 'bg-primary text-white shadow-sm shadow-primary/30'
                : 'text-slate-700 hover:text-primary hover:bg-white/80 active:scale-95'
            }`}
          >
            Support
          </button>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            onClick={() => navigate('/login')}
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-primary px-3 sm:px-3.5 py-1.5 rounded-full hover:bg-black/[0.04] transition-all cursor-pointer"
          >
            Log In
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="relative group overflow-hidden px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-primary via-primary to-secondary shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/35 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            {/* Shimmer light sweep */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
            <span className="relative flex items-center gap-1.5">
              <span>Get Started</span>
              <i className="ri-arrow-right-line text-xs transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-slate-700 hover:bg-black/[0.05] transition-colors ml-1 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <i className={`text-xl ${mobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}`} />
          </button>
        </div>
      </nav>

      {/* Mobile Floating Liquid Glass Dropdown Menu */}
      {mobileMenuOpen && (
        <div
          className="md:hidden mt-2 w-full rounded-3xl p-4 bg-white/85 backdrop-blur-2xl backdrop-saturate-200 border border-white/80 shadow-[0_20px_40px_-10px_rgba(20,30,80,0.18)] animate-slide-up"
          style={{ WebkitBackdropFilter: 'blur(24px) saturate(180%)' }}
        >
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleNavClick('features')}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
            >
              <span>Features</span>
              <i className="ri-arrow-right-s-line text-slate-400" />
            </button>
            <button
              onClick={() => handleNavClick('interactive-demo')}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
            >
              <span>Live Demo</span>
              <i className="ri-arrow-right-s-line text-slate-400" />
            </button>
            <button
              onClick={() => handleNavClick('workflow')}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
            >
              <span>How It Works</span>
              <i className="ri-arrow-right-s-line text-slate-400" />
            </button>
            <button
              onClick={handlePricingNav}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
            >
              <span>Pricing</span>
              <i className="ri-arrow-right-s-line text-slate-400" />
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/support');
              }}
              className="w-full text-left px-4 py-2.5 rounded-2xl text-sm font-semibold text-slate-800 hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-between"
            >
              <span>Support</span>
              <i className="ri-arrow-right-s-line text-slate-400" />
            </button>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-200/60 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/login');
              }}
              className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                navigate('/signup');
              }}
              className="w-full py-2.5 rounded-xl text-center text-sm font-bold text-white bg-gradient-to-r from-primary to-secondary shadow-md shadow-primary/25"
            >
              Get Started Free
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default PublicNavbar;
