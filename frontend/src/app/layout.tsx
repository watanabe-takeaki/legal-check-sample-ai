'use client';

import { useEffect, useState, useCallback } from 'react';
import { fetchMe, removeToken, getToken, createPortal, UserInfo } from '@/lib/api';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) {
      fetchMe()
        .then(setUser)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    removeToken();
    setUser(null);
    window.location.href = '/';
  }, []);

  const handlePortal = useCallback(async () => {
    try {
      const url = await createPortal();
      window.location.href = url;
    } catch (err: any) {
      alert(err.message);
    }
  }, []);

  return (
    <html lang="ja">
      <body>
        <header className="header">
          <div className="header-inner">
            <a href="/" className="logo">
              <div className="logo-icon">⚖️</div>
              <span className="logo-text">Regal Check AI</span>
              <span className="logo-badge">Beta</span>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {!loading && (
                <>
                  {user ? (
                    <>
                      {user.subscriptionStatus === 'active' && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--success)',
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontWeight: 600,
                          }}
                        >
                          Pro
                        </span>
                      )}
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {user.email}
                      </span>
                      {user.subscriptionStatus === 'active' && (
                        <button onClick={handlePortal} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                          プラン管理
                        </button>
                      )}
                      <button onClick={handleLogout} className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}>
                        ログアウト
                      </button>
                    </>
                  ) : (
                    <a href="/login" className="btn-secondary" style={{ textDecoration: 'none', padding: '0.5rem 1.2rem', fontSize: '0.85rem' }}>
                      ログイン
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </header>
        <main className="main">{children}</main>
        <footer className="footer">
          <p>© 2024 Regal Check AI. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem' }}>
            ⚠️ AI生成文書は参考目的です。法的効力を持たせる場合は弁護士にご相談ください。
          </p>
        </footer>
      </body>
    </html>
  );
}
