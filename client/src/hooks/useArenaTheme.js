import { useState, useEffect } from 'react';

const STORAGE_KEY = 'arena_theme_preference';

/**
 * Custom hook to toggle and persist Arena Mode color tone (light / dark).
 * Provides seamless theme switching for both classroom projectors (light)
 * and midnight gaming sessions (dark).
 */
export function useArenaTheme(defaultTheme = 'dark') {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
      return defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isDark = theme === 'dark';
  const isLight = theme === 'light';

  return {
    theme,
    isDark,
    isLight,
    setTheme,
    toggleTheme,
  };
}

export default useArenaTheme;
