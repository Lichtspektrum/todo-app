import { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (originX?: number, originY?: number) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (originX?: number, originY?: number) => {
    const doSwitch = () => {
      setTheme(t => (t === 'light' ? 'dark' : 'light'));
    };

    if (!document.startViewTransition || originX === undefined || originY === undefined) {
      doSwitch();
      return;
    }

    const maxRadius = Math.hypot(
      Math.max(originX, window.innerWidth - originX),
      Math.max(originY, window.innerHeight - originY)
    );

    document.documentElement.style.setProperty('--vt-x', `${originX}px`);
    document.documentElement.style.setProperty('--vt-y', `${originY}px`);
    document.documentElement.style.setProperty('--vt-r', `${maxRadius}px`);

    document.startViewTransition(doSwitch);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
