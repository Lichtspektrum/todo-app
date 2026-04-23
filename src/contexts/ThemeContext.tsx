/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

type Brand = 'anthropic' | 'nothing';
type Mode = 'light' | 'dark';

interface ThemeContextValue {
  brand: Brand;
  mode: Mode;
  toggleMode: (originX?: number, originY?: number) => void;
  toggleBrand: (originX?: number, originY?: number) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  brand: 'anthropic',
  mode: 'light',
  toggleMode: () => {},
  toggleBrand: () => {},
});

function migrateLegacyTheme(): { brand: Brand; mode: Mode } | null {
  const legacy = localStorage.getItem('theme');
  if (legacy === 'light') return { brand: 'anthropic', mode: 'light' };
  if (legacy === 'dark') return { brand: 'anthropic', mode: 'dark' };
  if (legacy === 'nothing') return { brand: 'nothing', mode: 'dark' };
  return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<Brand>(() => {
    const saved = localStorage.getItem('brand');
    if (saved === 'anthropic' || saved === 'nothing') return saved;
    return migrateLegacyTheme()?.brand ?? 'anthropic';
  });

  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('mode');
    if (saved === 'light' || saved === 'dark') return saved;
    const legacy = migrateLegacyTheme();
    if (legacy) return legacy.mode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-brand', brand);
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('brand', brand);
    localStorage.setItem('mode', mode);
  }, [brand, mode]);

  const runTransition = (fn: () => void, originX?: number, originY?: number) => {
    if (!document.startViewTransition || originX === undefined || originY === undefined) {
      fn();
      return;
    }
    const maxRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    );
    document.documentElement.style.setProperty('--vt-x', `${originX}px`);
    document.documentElement.style.setProperty('--vt-y', `${originY}px`);
    document.documentElement.style.setProperty('--vt-r', `${maxRadius}px`);
    document.startViewTransition(fn);
  };

  const toggleMode = (originX?: number, originY?: number) => {
    runTransition(() => setMode(m => m === 'light' ? 'dark' : 'light'), originX, originY);
  };

  const toggleBrand = (originX?: number, originY?: number) => {
    runTransition(() => setBrand(b => b === 'anthropic' ? 'nothing' : 'anthropic'), originX, originY);
  };

  return (
    <ThemeContext.Provider value={{ brand, mode, toggleMode, toggleBrand }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
