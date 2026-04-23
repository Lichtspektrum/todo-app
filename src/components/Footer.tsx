import { useState } from 'react';

export function Footer() {
  const [donateOpen, setDonateOpen] = useState(false);

  return (
    <>
      <footer className="footer">
        <a href="https://github.com/Lichtspektrum/todo-app/releases/tag/v1.4.0" target="_blank" rel="noopener noreferrer">[v1.4.0]</a>
        <span className="footer-dot">·</span>
        <a href="https://github.com/Lichtspektrum/todo-app" target="_blank" rel="noopener noreferrer">[GitHub]</a>
        <span className="footer-dot">·</span>
        <a href="https://github.com/Lichtspektrum/todo-app/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">[MIT]</a>
        <span className="footer-dot">·</span>
        <a href="https://x.com/lichtspektrum" target="_blank" rel="noopener noreferrer">[X]</a>
        <span className="footer-dot">·</span>
        <button className="footer-link" onClick={() => setDonateOpen(true)}>[赞助 ¥1]</button>
      </footer>

      {donateOpen && (
        <div className="donate-overlay" onClick={() => setDonateOpen(false)}>
          <div className="donate-modal" onClick={e => e.stopPropagation()}>
            <button className="donate-close" onClick={() => setDonateOpen(false)}>×</button>
            <p className="donate-title">扫码支持作者</p>
            <img src="/alipay-qr.jpg" alt="支付宝收款码" className="donate-qr" />
            <p className="donate-hint">支付宝扫一扫</p>
          </div>
        </div>
      )}
    </>
  );
}
