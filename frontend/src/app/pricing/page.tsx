'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMe, createCheckout, getToken } from '@/lib/api';

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.push('/login');
    }
  }, [router]);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await fetchMe();
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.subscriptionStatus === 'active') {
        router.push('/');
        return;
      }
      const url = await createCheckout();
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 560, margin: '0 auto', padding: '3rem 0' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="hero-title" style={{ fontSize: '2rem' }}>
          料金プラン
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '0.95rem' }}>
          プロフェッショナルな法的文書をAIで無制限に生成
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--accent-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: 'var(--accent-gradient)',
          }}
        />

        <div
          style={{
            display: 'inline-block',
            background: 'var(--accent-gradient)',
            color: 'white',
            padding: '4px 16px',
            borderRadius: 20,
            fontSize: '0.75rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Pro Plan
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            ¥980
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            /月
          </span>
        </div>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 2rem',
            textAlign: 'left',
          }}
        >
          {[
            '全12種類の法的文書を無制限に生成',
            'GPT-4o搭載の高品質AI文書生成',
            '日本法に完全準拠',
            'SSEリアルタイムストリーミング',
            'コピー＆ダウンロード機能',
            'いつでも解約可能',
          ].map((feature, i) => (
            <li
              key={i}
              style={{
                padding: '0.6rem 0',
                borderBottom: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ color: 'var(--success)' }}>✓</span>
              {feature}
            </li>
          ))}
        </ul>

        {error && (
          <div
            className="disclaimer"
            style={{
              borderColor: 'rgba(239, 68, 68, 0.3)',
              background: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--error)',
              marginBottom: '1rem',
            }}
          >
            <span className="disclaimer-icon">❌</span>
            {error}
          </div>
        )}

        <button
          className="submit-btn"
          onClick={handleSubscribe}
          disabled={loading}
          style={{ maxWidth: '100%' }}
        >
          <span className="submit-btn-loading">
            {loading ? (
              <>
                <div className="spinner" />
                処理中...
              </>
            ) : (
              '💳 サブスクリプションを開始'
            )}
          </span>
        </button>

        <p
          style={{
            marginTop: '1rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          安全な決済はStripeが提供します。いつでもキャンセル可能です。
        </p>
      </div>
    </div>
  );
}
