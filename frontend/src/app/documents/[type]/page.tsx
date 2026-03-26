'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { DocumentType, fetchDocumentType, generateDocumentStream } from '@/lib/api';
import ReactMarkdown from 'react-markdown';

export default function DocumentPage() {
  const params = useParams();
  const typeId = params.type as string;

  const [docType, setDocType] = useState<DocumentType | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetchDocumentType(typeId)
      .then((data) => {
        setDocType(data);
        const initialFields: Record<string, string> = {};
        data.fields.forEach((field) => {
          initialFields[field.id] = '';
        });
        setFields(initialFields);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [typeId]);

  const handleFieldChange = useCallback((fieldId: string, value: string) => {
    setFields((prev) => ({ ...prev, [fieldId]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!docType) return;

      // Validate required fields
      const missingFields = docType.fields
        .filter((f) => f.required && !fields[f.id])
        .map((f) => f.label);

      if (missingFields.length > 0) {
        setError(`以下の必須項目を入力してください：${missingFields.join('、')}`);
        return;
      }

      setError(null);
      setGenerating(true);
      setGeneratedContent('');
      setShowPreview(true);

      generateDocumentStream(
        typeId,
        fields,
        (content) => {
          setGeneratedContent((prev) => prev + content);
        },
        () => {
          setGenerating(false);
        },
        (errMsg) => {
          setError(errMsg);
          setGenerating(false);
        },
      );
    },
    [docType, fields, typeId],
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(generatedContent).then(() => {
      setToast('クリップボードにコピーしました');
      setTimeout(() => setToast(null), 3000);
    });
  }, [generatedContent]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docType?.name || 'document'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast('ファイルをダウンロードしました');
    setTimeout(() => setToast(null), 3000);
  }, [generatedContent, docType]);

  const handleReset = useCallback(() => {
    setShowPreview(false);
    setGeneratedContent('');
    setError(null);
  }, []);

  if (loading) {
    return (
      <div className="hero">
        <div className="spinner" style={{ margin: '4rem auto', width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  if (!docType) {
    return (
      <div className="hero">
        <h1 className="hero-title">文書タイプが見つかりません</h1>
        <p className="hero-subtitle">指定された文書タイプは存在しません。</p>
        <a href="/" className="back-link" style={{ justifyContent: 'center', marginTop: '2rem' }}>
          ← トップページに戻る
        </a>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <a href="/" className="back-link">← 文書タイプ選択に戻る</a>
        <div className="page-title-section">
          <div
            className="page-icon"
            style={{ background: `${docType.color}15` }}
          >
            {docType.icon}
          </div>
          <h1 className="page-title">{docType.name}</h1>
        </div>
        <p className="page-desc">{docType.description}</p>
      </div>

      {typeId === 'will' && (
        <div className="disclaimer">
          <span className="disclaimer-icon">⚠️</span>
          <strong>重要な注意事項：</strong>日本法では遺言書には厳格な方式要件があります。
          自筆証書遺言は全文を自筆で作成する必要があり、AI生成文書はそのまま法的効力を持ちません。
          法的効力のある遺言書を作成するには、公正証書遺言の作成を強くお勧めします。
          本機能で生成する文書はあくまで参考用ドラフトです。
        </div>
      )}

      {!showPreview ? (
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {docType.fields.map((field) => (
              <div className="form-group" key={field.id}>
                <label
                  className={`form-label ${field.required ? 'form-label-required' : ''}`}
                  htmlFor={`field-${field.id}`}
                >
                  {field.label}
                </label>

                {field.type === 'text' && (
                  <input
                    type="text"
                    id={`field-${field.id}`}
                    className="form-input"
                    placeholder={field.placeholder}
                    value={fields[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />
                )}

                {field.type === 'textarea' && (
                  <textarea
                    id={`field-${field.id}`}
                    className="form-textarea"
                    placeholder={field.placeholder}
                    value={fields[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  />
                )}

                {field.type === 'select' && field.options && (
                  <select
                    id={`field-${field.id}`}
                    className="form-select"
                    value={fields[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  >
                    <option value="">選択してください</option>
                    {field.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && field.options && (
                  <div className="radio-group">
                    {field.options.map((opt) => (
                      <div className="radio-option" key={opt.value}>
                        <input
                          type="radio"
                          id={`field-${field.id}-${opt.value}`}
                          name={field.id}
                          value={opt.value}
                          checked={fields[field.id] === opt.value}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        />
                        <label htmlFor={`field-${field.id}-${opt.value}`}>
                          {opt.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {error && (
              <div className="disclaimer" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--error)' }}>
                <span className="disclaimer-icon">❌</span>
                {error}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={generating}>
              <span className="submit-btn-loading">
                {generating ? (
                  <>
                    <div className="spinner" />
                    AIが文書を生成中...
                  </>
                ) : (
                  <>✨ AIで文書を生成する</>
                )}
              </span>
            </button>
          </form>
        </div>
      ) : (
        <div className="preview-container">
          <div className="preview-header">
            <h2 className="preview-title">
              {generating ? '📝 文書を生成中...' : '✅ 文書が生成されました'}
            </h2>
            <div className="preview-actions">
              {!generating && (
                <>
                  <button className="btn-secondary" onClick={handleCopy}>
                    📋 コピー
                  </button>
                  <button className="btn-secondary" onClick={handleDownload}>
                    💾 ダウンロード
                  </button>
                  <button className="btn-secondary" onClick={handleReset}>
                    🔄 再入力
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            この文書はAIが生成した参考用ドラフトです。法的効力を持たせる場合は、必ず弁護士にご確認ください。
          </div>

          <div className={`preview-content ${generating ? 'streaming-cursor' : ''}`}>
            <ReactMarkdown>{generatedContent}</ReactMarkdown>
          </div>

          {!generating && generatedContent && (
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="submit-btn" style={{ maxWidth: 300 }} onClick={handleReset}>
                🔄 別の内容で再生成
              </button>
              <a href="/" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', padding: '1rem 2rem', textDecoration: 'none' }}>
                🏠 トップに戻る
              </a>
            </div>
          )}
        </div>
      )}

      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
