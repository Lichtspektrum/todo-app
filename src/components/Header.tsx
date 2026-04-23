import { useLang } from '../contexts/LangContext';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const { t, lang, toggleLang } = useLang();
  const { brand, mode, toggleMode, toggleBrand } = useTheme();
  const dateStr = new Date().toLocaleDateString(t.dateLocale, {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  const getOrigin = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handleModeToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { x, y } = getOrigin(e);
    toggleMode(x, y);
  };

  const handleBrandToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { x, y } = getOrigin(e);
    toggleBrand(x, y);
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

          <button
            className="theme-toggle"
            onClick={handleBrandToggle}
            title="Toggle brand"
            aria-label={brand === 'anthropic' ? t.switchToNothing : t.switchToAnthropic}
          >
            {brand === 'anthropic' ? (
              <svg viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="5" /></svg>
            ) : (
              <svg viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3" cy="3" r="1.5" fill="currentColor" />
                <circle cx="7.5" cy="3" r="1.5" fill="currentColor" />
                <circle cx="12" cy="3" r="1.5" fill="currentColor" />
                <circle cx="3" cy="7.5" r="1.5" fill="currentColor" />
                <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="7.5" r="1.5" fill="currentColor" />
                <circle cx="3" cy="12" r="1.5" fill="currentColor" />
                <circle cx="7.5" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            )}
          </button>

          <button
            className="theme-toggle"
            onClick={handleModeToggle}
            title="Toggle light/dark"
            aria-label={mode === 'light' ? t.switchToDark : t.switchToLight}
          >
            {mode === 'light' ? (
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
