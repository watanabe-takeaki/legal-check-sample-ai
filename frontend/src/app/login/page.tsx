'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signup, login, setToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = isSignup
        ? await signup(email, password)
        : await login(email, password);

      setToken(result.token);

      if (result.user.subscriptionStatus === 'active') {
        router.push('/');
      } else {
        router.push('/pricing');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 480, margin: '0 auto', padding: '3rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2rem' }}>
          {isSignup ? 'アカウント作成' : 'ログイン'}
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '0.95rem' }}>
          {isSignup
            ? 'メールアドレスとパスワードで登録'
            : 'メールアドレスとパスワードでログイン'}
        </p>
      </div>

      <div className="form-container" style={{ padding: 0 }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label form-label-required" htmlFor="email">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label form-label-required" htmlFor="password">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder={isSignup ? '8文字以上' : 'パスワード'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isSignup ? 8 : undefined}
            />
          </div>

          {error && (
            <div
              className="disclaimer"
              style={{
                borderColor: 'rgba(239, 68, 68, 0.3)',
                background: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--error)',
              }}
            >
              <span className="disclaimer-icon">❌</span>
              {error}
            </div>
          )}

          <button type="submit" className="submit-btn" disabled={loading}>
            <span className="submit-btn-loading">
              {loading ? (
                <>
                  <div className="spinner" />
                  処理中...
                </>
              ) : isSignup ? (
                '🚀 アカウントを作成'
              ) : (
                '🔑 ログイン'
              )}
            </span>
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.9rem',
            }}
          >
            {isSignup
              ? '既にアカウントをお持ちの方はこちら'
              : 'アカウントをお持ちでない方はこちら'}
          </button>
        </div>
      </div>
    </div>
  );
}
