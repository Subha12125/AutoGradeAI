import React from 'react';

/**
 * Clean, modern theme toggle button for Arena modes.
 * Displays current active mode with a subtle icon and clear label.
 */
export const ArenaThemeToggle = ({ isDark, toggleTheme, className = '' }) => {
  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`h-10 px-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 select-none active:scale-95 ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10 shadow-sm'
          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle Arena Color Tone"
    >
      <i className={isDark ? 'ri-moon-fill text-indigo-400 text-sm' : 'ri-sun-fill text-amber-500 text-sm'} />
      <span className="text-xs font-medium hidden sm:inline">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};

export default ArenaThemeToggle;
