const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// --- 認証関連 ---
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('regal_token');
}

export function setToken(token: string) {
  localStorage.setItem('regal_token', token);
}

export function removeToken() {
  localStorage.removeItem('regal_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export interface UserInfo {
  id: string;
  email: string;
  subscriptionStatus: string;
}

export async function signup(email: string, password: string): Promise<{ token: string; user: UserInfo }> {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'サインアップに失敗しました。');
  return data;
}

export async function login(email: string, password: string): Promise<{ token: string; user: UserInfo }> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'ログインに失敗しました。');
  return data;
}

export async function fetchMe(): Promise<UserInfo | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: authHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  } catch {
    return null;
  }
}

export async function createCheckout(): Promise<string> {
  const res = await fetch(`${API_URL}/api/stripe/create-checkout`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Checkoutの作成に失敗しました。');
  return data.url;
}

export async function createPortal(): Promise<string> {
  const res = await fetch(`${API_URL}/api/stripe/create-portal`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Portalの作成に失敗しました。');
  return data.url;
}

export async function syncSubscriptionStatus(): Promise<string> {
  const res = await fetch(`${API_URL}/api/stripe/sync-status`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '同期に失敗しました。');
  return data.subscriptionStatus;
}

// --- 文書関連 ---
export interface DocumentType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'radio';
  placeholder: string;
  required: boolean;
  options?: { value: string; label: string }[];
}

export async function fetchDocumentTypes(): Promise<DocumentType[]> {
  const res = await fetch(`${API_URL}/api/documents/types`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch document types');
  return res.json();
}

export async function fetchDocumentType(id: string): Promise<DocumentType> {
  const res = await fetch(`${API_URL}/api/documents/types/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to fetch document type');
  return res.json();
}

export function generateDocumentStream(
  documentTypeId: string,
  fields: Record<string, string>,
  onChunk: (content: string) => void,
  onDone: () => void,
  onError: (error: string) => void,
) {
  const abortController = new AbortController();

  fetch(`${API_URL}/api/documents/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ documentTypeId, fields }),
    signal: abortController.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        const err = await response.json();
        if (err.code === 'SUBSCRIPTION_REQUIRED') {
          onError('サブスクリプションが必要です。料金プランをご確認ください。');
          return;
        }
        throw new Error(err.error || '文書の生成に失敗しました。');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Stream not available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.done) {
                onDone();
                return;
              }
              if (data.error) {
                onError(data.error);
                return;
              }
              if (data.content) {
                onChunk(data.content);
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      }
      onDone();
    })
    .catch((error) => {
      if (error.name !== 'AbortError') {
        onError(error.message);
      }
    });

  return () => abortController.abort();
}
