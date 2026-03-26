'use client';

import { useEffect, useState } from 'react';
import { DocumentType, fetchDocumentTypes } from '@/lib/api';

export default function HomePage() {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocumentTypes()
      .then(setDocumentTypes)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
        <p className="hero-subtitle">バックエンドサーバーに接続できませんでした。<br/>サーバーが起動しているか確認してください。</p>
      </div>
    );
  }

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
      </section>

      <div className="disclaimer fade-in fade-in-delay-1">
        <span className="disclaimer-icon">⚠️</span>
        AI生成文書はあくまで参考用ドラフトです。法的効力を持たせる場合は必ず弁護士にご相談ください。
        生成された文書を適切な専門家のレビューなしに使用することは推奨しません。
      </div>

      <div className="doc-grid">
        {documentTypes.map((doc, index) => (
          <a
            key={doc.id}
            href={`/documents/${doc.id}`}
            className={`doc-card fade-in fade-in-delay-${Math.min(index % 3 + 1, 3)}`}
            style={{
              '--card-accent': `linear-gradient(135deg, ${doc.color}, ${doc.color}88)`,
            } as React.CSSProperties}
            id={`doc-card-${doc.id}`}
          >
            <div
              className="doc-card-icon"
              style={{ background: `${doc.color}15` }}
            >
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
