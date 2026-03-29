import { useState, useEffect, useCallback } from 'react';
import { THEME_KEY } from '@/shared/config/constants';

export type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  const saved = localStorage.getItem(THEME_KEY) as Theme | null;
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme: Theme): void {
  const isDark = theme === 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;
  document.body.classList.toggle('light-mode', !isDark);
  document.body.classList.toggle('dark-mode',  isDark);
  localStorage.setItem(THEME_KEY, theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Sync OS preference when no saved preference
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}
