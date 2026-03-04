export function Header() {
  const dateStr = new Date().toLocaleDateString('zh-CN', {
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
      <h1>今天要做什么？</h1>
      <p className="subtitle">{dateStr}</p>
    </div>
  );
}
