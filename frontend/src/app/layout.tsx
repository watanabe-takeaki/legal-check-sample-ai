import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Regal Check AI - AI法的文書生成サービス',
  description: '日本法に準拠した法的文書をAIが自動生成。NDA、業務委託契約書、利用規約、プライバシーポリシーなど、プロフェッショナルな法的文書を数分で作成。',
  keywords: ['法的文書', 'AI', 'NDA', '契約書', '利用規約', 'プライバシーポリシー', '日本法'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          </div>
        </header>
        <main className="main">
          {children}
        </main>
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
