'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { DocumentType, fetchDocumentTypes, fetchMe, getToken, syncSubscriptionStatus, UserInfo } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      const doCheck = async () => {
        // 決済完了後はStripeからサブスク状態を同期
        if (searchParams.get('payment') === 'success') {
          try {
            await syncSubscriptionStatus();
          } catch (e) {
            console.warn('Sync failed:', e);
          }
          setPaymentSuccess(true);
        }
        const u = await fetchMe();
        setUser(u);
        setAuthChecked(true);
      };
      doCheck();
    } else {
      setAuthChecked(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!authChecked) return;
    fetchDocumentTypes()
      .then(setDocumentTypes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authChecked]);

  // 未ログイン: ランディングページ
  if (authChecked && !user) {
    return (
      <div>
        <section className="hero fade-in">
          <h1 className="hero-title">
            AIで作る、<br />
            プロフェッショナルな法的文書
          </h1>
          <p className="hero-subtitle">
            <span className="hero-highlight">日本法に準拠</span>した法的文書をAIが数分で生成。
            NDA、業務委託契約書から利用規約まで、あらゆるビジネス文書に対応。
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <a href="/login" className="submit-btn" style={{ maxWidth: 280, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              🚀 無料で始める
            </a>
            <a href="/pricing" className="btn-secondary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', padding: '1rem 2rem' }}>
              💰 料金を見る
            </a>
          </div>
        </section>

        <div className="disclaimer fade-in fade-in-delay-1">
          <span className="disclaimer-icon">⚠️</span>
          AI生成文書はあくまで参考用ドラフトです。法的効力を持たせる場合は必ず弁護士にご相談ください。
        </div>

        {!loading && (
          <div className="doc-grid">
            {documentTypes.map((doc, index) => (
              <div
                key={doc.id}
                className={`doc-card fade-in fade-in-delay-${Math.min((index % 3) + 1, 3)}`}
                style={{ cursor: 'default', '--card-accent': `linear-gradient(135deg, ${doc.color}, ${doc.color}88)` } as React.CSSProperties}
              >
                <div className="doc-card-icon" style={{ background: `${doc.color}15` }}>
                  {doc.icon}
                </div>
                <h3 className="doc-card-title">{doc.name}</h3>
                <p className="doc-card-desc">{doc.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ログイン済み + 未課金: 料金ページへ
  if (authChecked && user && user.subscriptionStatus !== 'active') {
    router.push('/pricing');
    return null;
  }

  // ログイン済み + 課金済み: 文書選択
  if (loading) {
    return (
      <div className="hero">
        <div className="spinner" style={{ margin: '4rem auto', width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="hero">
        <h1 className="hero-title">接続エラー</h1>
        <p className="hero-subtitle">
          バックエンドサーバーに接続できませんでした。<br />
          サーバーが起動しているか確認してください。
        </p>
      </div>
    );
  }

  return (
    <div>
      {paymentSuccess && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: 'var(--success)',
          }}
        >
          🎉 サブスクリプションが有効になりました！すべての文書を生成できます。
        </div>
      )}

      <section className="hero fade-in">
        <h1 className="hero-title">
          AIで作る、<br />
          プロフェッショナルな法的文書
        </h1>
        <p className="hero-subtitle">
          <span className="hero-highlight">日本法に準拠</span>した法的文書をAIが数分で生成。
        </p>
      </section>

      <div className="disclaimer fade-in fade-in-delay-1">
        <span className="disclaimer-icon">⚠️</span>
        AI生成文書はあくまで参考用ドラフトです。法的効力を持たせる場合は必ず弁護士にご相談ください。
      </div>

      <div className="doc-grid">
        {documentTypes.map((doc, index) => (
          <a
            key={doc.id}
            href={`/documents/${doc.id}`}
            className={`doc-card fade-in fade-in-delay-${Math.min((index % 3) + 1, 3)}`}
            style={{ '--card-accent': `linear-gradient(135deg, ${doc.color}, ${doc.color}88)` } as React.CSSProperties}
            id={`doc-card-${doc.id}`}
          >
            <div className="doc-card-icon" style={{ background: `${doc.color}15` }}>
              {doc.icon}
            </div>
            <h3 className="doc-card-title">{doc.name}</h3>
            <p className="doc-card-desc">{doc.description}</p>
            <span className="doc-card-arrow">→</span>
          </a>
        ))}
      </div>
    </div>
  );
}
