'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';
interface ThemeCtx { theme: Theme; toggle: () => void; }

const Ctx = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('orca-theme') as Theme | null;
    if (stored) apply(stored);
  }, []);

  function apply(t: Theme) {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('orca-theme', t);
  }

  return (
    <Ctx.Provider value={{ theme, toggle: () => apply(theme === 'dark' ? 'light' : 'dark') }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() { return useContext(Ctx); }
