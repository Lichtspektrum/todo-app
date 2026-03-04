import { useLang } from '../contexts/LangContext';

export function Header() {
  const { t } = useLang();
  const dateStr = new Date().toLocaleDateString(t.dateLocale, {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  return (
    <div className="header">
      <div className="header-top">
        <div className="logo">
          <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="5" /></svg>
        </div>
        <span className="app-name">Todo</span>
      </div>
      <h1>{t.title}</h1>
      <p className="subtitle">{dateStr}</p>
    </div>
  );
}
