import { useLang } from '../contexts/LangContext';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { t, lang, toggleLang } = useLang();
  const { theme, toggleTheme } = useTheme();
  const dateStr = new Date().toLocaleDateString(t.dateLocale, {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    toggleTheme(x, y);
  };

  return (
    <div className="header">
      <div className="header-top">
        <div className="logo">
          <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" /></svg>
        </div>
        <span className="app-name">Todo</span>
        
        <div className="header-actions">
          <button className="lang-toggle" onClick={toggleLang} title="Switch language" aria-label={lang === 'zh' ? 'Switch to English' : '切换为中文'}>
            <span className={lang === 'zh' ? 'active' : ''}>中</span>
            <span className="separator">·</span>
            <span className={lang === 'en' ? 'active' : ''}>EN</span>
          </button>

          <button className="theme-toggle" onClick={handleToggle} title="Toggle theme" aria-label={theme === 'light' ? t.switchToDark : t.switchToLight}>
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <h1>{t.title}</h1>
      <p className="subtitle">{dateStr}</p>
    </div>
  );
}
